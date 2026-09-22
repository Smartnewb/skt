import { NextRequest, NextResponse } from 'next/server';
import { ApplicationData } from '@/types/application';
import { createApplication } from '@/lib/database';
import {
  sendSlackNotification,
  formatApplicationSlackMessage,
} from '@/lib/slack';
import { formatProductName } from '@/lib/productFormatter';

export async function POST(request: NextRequest) {
  // The full signup flow collects account/card/birthdate PII and is gated
  // behind ENABLE_FULL_APPLY (default off) until Phase-1 hardening lands.
  if (process.env.ENABLE_FULL_APPLY !== 'true') {
    return NextResponse.json(
      { error: '가입 신청은 현재 이용할 수 없습니다. 상담 신청을 이용해주세요.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const applicationData: ApplicationData = body;

    if (!applicationData.applicant?.name || !applicationData.applicant?.contact?.phone) {
      return NextResponse.json(
        { error: '신청자명과 전화번호는 필수입니다' },
        { status: 400 }
      );
    }

    if (!applicationData.product?.speed) {
      return NextResponse.json(
        { error: '상품 정보가 누락되었습니다' },
        { status: 400 }
      );
    }

    if (!applicationData.payment?.method) {
      return NextResponse.json(
        { error: '납부 방법을 선택해주세요' },
        { status: 400 }
      );
    }

    const result = await createApplication(applicationData);

    const productSummary = formatProductName(result.product);
    const slackMessage = formatApplicationSlackMessage({
      id: result.id,
      applicantPhone: result.applicant?.contact?.phone,
      productSummary,
    });
    await sendSlackNotification(slackMessage);

    return NextResponse.json(
      {
        success: true,
        id: result.id,
        message: '가입 신청이 접수되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: '가입 신청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
