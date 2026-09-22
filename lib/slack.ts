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

/**
 * Mask a Korean phone number: 010-1234-5678 → 010-****-5678.
 * Slack messages must never contain the full number.
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return '-';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 8) {
    return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
  }
  return '***-****-****';
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

const PREFERRED_TIME_LABELS: Record<string, string> = {
  ANYTIME: '언제든지',
  MORNING: '오전',
  AFTERNOON: '오후',
  EVENING: '저녁',
};

interface ConsultationSlackInput {
  /** Optional — absent when the anon fallback inserted without RETURNING. */
  id?: string;
  customerPhone: string;
  interestedProduct?: string | null;
  region?: string | null;
  preferredTime?: string | null;
}

/**
 * PII-safe consultation notification.
 * Contains ONLY: record id, masked phone, interested product, region,
 * preferred time. Never name / full phone / address / birthdate / account /
 * card data.
 */
export function formatConsultationSlackMessage(data: ConsultationSlackInput): SlackMessage {
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
            text: `*상담 ID:*\n${data.id ?? '-'}`,
          },
          {
            type: 'mrkdwn',
            text: `*전화번호:*\n${maskPhone(data.customerPhone)}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*관심 상품:*\n${data.interestedProduct || '미선택'}`,
          },
          {
            type: 'mrkdwn',
            text: `*설치 지역:*\n${data.region || '미입력'}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*연락 희망 시간:*\n${data.preferredTime ? PREFERRED_TIME_LABELS[data.preferredTime] || data.preferredTime : '미선택'}`,
          },
          {
            type: 'mrkdwn',
            text: `*신청 시간:*\n${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
          },
        ],
      },
    ],
  };
}

interface ApplicationSlackInput {
  id: string;
  applicantPhone?: string | null;
  productSummary?: string | null;
}

/**
 * PII-safe application notification.
 * Contains ONLY: record id, masked phone, product summary.
 * Never name / full phone / address / birthdate / account / card data.
 */
export function formatApplicationSlackMessage(data: ApplicationSlackInput): SlackMessage {
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
            text: `*신청 ID:*\n${data.id}`,
          },
          {
            type: 'mrkdwn',
            text: `*전화번호:*\n${maskPhone(data.applicantPhone)}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*상품:*\n${data.productSummary || '정보 없음'}`,
          },
          {
            type: 'mrkdwn',
            text: `*신청 시간:*\n${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
          },
        ],
      },
    ],
  };
}
