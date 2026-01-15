import { ConsultationData } from '@/types/consultation';
import { ApplicationData } from '@/types/application';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface SlackMessage {
  text?: string;
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
    };
    fields?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

export async function sendSlackNotification(message: SlackMessage): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    console.error('SLACK_WEBHOOK_URL is not configured');
    return false;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

export function formatConsultationSlackMessage(data: ConsultationData): SlackMessage {
  const productInfo = data.product
    ? `${data.product.speed || '미선택'} / ${data.product.bundle || '미선택'}`
    : '상품 미선택';

  const priceInfo = data.product
    ? `월 ${data.product.monthlyPrice?.toLocaleString() || '정보 없음'}원 / 사은품 ${data.product.giftAmount?.toLocaleString() || '0'}원`
    : '가격 정보 없음';

  return {
    text: '🔔 새로운 상담 신청이 접수되었습니다',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔔 새로운 상담 신청',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*고객명:*\n${data.customerName}`,
          },
          {
            type: 'mrkdwn',
            text: `*전화번호:*\n${data.customerPhone}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*상품 정보:*\n${productInfo}`,
          },
          {
            type: 'mrkdwn',
            text: `*가격:*\n${priceInfo}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*신청 시간:* ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
        },
      },
    ],
  };
}

export function formatApplicationSlackMessage(data: ApplicationData): SlackMessage {
  const productInfo = data.product?.tvType
    ? `${data.product.speed} / ${data.product.tvType}`
    : data.product?.speed || '상품 정보 없음';
  const paymentMethod =
    data.payment?.method === 'CARD' ? '카드 자동결제' : '계좌 자동이체';

  return {
    text: '📝 새로운 가입 신청이 접수되었습니다',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📝 새로운 가입 신청',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*신청자:*\n${data.applicant?.name || '정보 없음'}`,
          },
          {
            type: 'mrkdwn',
            text: `*전화번호:*\n${data.applicant?.contact?.phone || '정보 없음'}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*상품:*\n${productInfo}`,
          },
          {
            type: 'mrkdwn',
            text: `*월 납부액:*\n${data.product?.monthlyPrice?.toLocaleString() || '정보 없음'}원`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*납부 방법:*\n${paymentMethod}`,
          },
          {
            type: 'mrkdwn',
            text: `*설치 주소:*\n${data.applicant?.address?.basic || '정보 없음'}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*신청 시간:* ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
        },
      },
    ],
  };
}
