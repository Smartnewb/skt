import { NextRequest, NextResponse } from 'next/server';
import { ConsultationData } from '@/types/consultation';
import { createConsultation } from '@/lib/consultationDatabase';
import {
  sendSlackNotification,
  formatConsultationSlackMessage,
} from '@/lib/slack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const consultationData: ConsultationData = body;

    if (!consultationData.customerName || !consultationData.customerPhone) {
      return NextResponse.json(
        { error: '고객명과 전화번호는 필수입니다' },
        { status: 400 }
      );
    }

    if (!consultationData.privacyConsent) {
      return NextResponse.json(
        { error: '개인정보 수집 및 이용에 동의해주세요' },
        { status: 400 }
      );
    }

    await createConsultation(consultationData);

    const slackMessage = formatConsultationSlackMessage(consultationData);
    await sendSlackNotification(slackMessage);

    return NextResponse.json(
      {
        success: true,
        message: '상담 신청이 접수되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { error: '상담 신청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
