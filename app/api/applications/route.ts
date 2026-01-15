import { NextRequest, NextResponse } from 'next/server';
import { ApplicationData } from '@/types/application';
import { createApplication } from '@/lib/database';
import {
  sendSlackNotification,
  formatApplicationSlackMessage,
} from '@/lib/slack';

export async function POST(request: NextRequest) {
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

    const slackMessage = formatApplicationSlackMessage(applicationData);
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
