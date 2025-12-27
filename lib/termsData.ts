// Terms and conditions data for agreement page
export interface TermItem {
    id: string;
    title: string;
    required: boolean;
    content: string; // HTML content
}

export const TERMS: TermItem[] = [
    {
        id: 'required_notice',
        title: '필독사항',
        required: true,
        content: `
            <div class="terms-content">
                <h3 class="text-lg font-bold mb-4">필독사항</h3>
                <ol class="space-y-3 text-sm">
                    <li>1. 먼저 신규 인터넷을 설치 마친 뒤, 기존 인터넷을 직접 해지 신청하셔야 합니다.</li>
                    <li>2. 미납 및 연체금이 있을 경우 납부 후 신청 가능합니다.</li>
                    <li>3. 교육청할인, 복지할인 신청의 경우 사은품 환수 될 수 있습니다.</li>
                    <li>4. PC/테블릿/노트북 등 전자기기로 Window OS를 3대 이상 사용할 경우, 추가 단말 요금이 발생합니다(최대 2대까지).</li>
                    <li>5. 설치비가 한번 발생하며, 익월에 한번 월요금에 합산청구되어집니다.</li>
                    <li>6. SK 알뜰폰의 경우, 결합의 유무는 확실히 알려 드릴 수 없기에, 직접 본사에서 한번 더 확인해주셔야 합니다.</li>
                    <li>7. 필독사항을 충분히 숙지한 뒤 신청바랍니다.</li>
                </ol>
            </div>
        `
    },
    {
        id: 'terms_of_service',
        title: '이용약관',
        required: true,
        content: `
            <div class="terms-content">
                <h3 class="text-lg font-bold mb-4">이용약관</h3>
                <p class="mb-4 text-sm leading-relaxed">
                    본 신청서는 신청자(가입자, 납입자)가 직접 작성하였고, 신청자는 가입자 본인으로 본 신청서에 기재된 통장이체 또는 카드이체를 해당은행 CMS 신청에 동의합니다.
                </p>
                <p class="mb-4 text-sm leading-relaxed">
                    또한 신청서 작성전 본 광고에 기재된 통신상품의 제반안내에 관하여 충분히 이해하였으며, 신청자가 신청한 개인정보를 영업자가 대행하여 해당 통신사 본사에 대행 접수하는 것에 동의합니다.
                </p>
                <p class="mb-4 text-sm font-semibold text-orange-600">
                    ※ 개인정보 수집 동의 내용을 꼭 읽어보신 후 동의체크 후 신청 바랍니다.
                </p>
                <ol class="space-y-3 text-sm">
                    <li>1. 설치비는 전액 고객 부담입니다.</li>
                    <li>2. 신청 통신사와 본인 및 가족의 명의로 동일 통신사를 사용 중이시면 1년 필수 유지하여야 하며, 해지 시 사은품은 전액 환수됩니다.</li>
                    <li>3. 3년 약정기준이며, 1년 이내 모든 해지(위면해지, 직권해지포함) 및 정지 시 위약금과 별도로 사은품 환수가 발생합니다.</li>
                    <li>4. 결합할인 상품 가능여부는 통신사 본사 고객센터 확인 후 진행해주셔야 하며, 추후 결합이 불가한 경우 책임지지 않습니다.</li>
                    <li>5. 약정기간내 해지 시 위약금이 발생됩니다.</li>
                    <li>6. 1년간 자동이체, 카드이체만 가능하시며 지로납부로 변경 시 전액 환수 조치됩니다.</li>
                    <li>7. PC/태블릿/노트북 등 단말기를 동시에 3대 이상 사용할 경우 추가 단말 요금이 발생합니다.</li>
                    <li>8. 1년 이내 해지 시 해지위약금에 할인 받으신 설치비도 포함되십니다.</li>
                    <li>9. 설치 후에 동일장소 해지 이력으로 간혹 소명 요청이 발생할 수 있습니다. 이때 간단한 증명 서류가 필요하며, 만약 증빙불가한 경우 통신사 본사로부터 사은품 환수가 발생할 수 있는 점 유의바랍니다. (필요한 서류: 부동산계약서/등본/기존회선 가입증명원/납부내역서 9개월치)</li>
                    <li>10. 통신사에서 정해놓은 하루 데이터 사용 초과 시 자정까지 속도가 제어되며, 가정용으로 너무 많은 PC, 노트북을 동시에 사용하실 수는 없으십니다. (3대 이상 시)</li>
                </ol>
            </div>
        `
    },
    {
        id: 'privacy_collection',
        title: '개인정보 수집 및 활용 동의',
        required: true,
        content: `
            <div class="terms-content">
                <h3 class="text-lg font-bold mb-4">개인정보 수집 및 활용 동의</h3>
                <p class="mb-4 text-sm leading-relaxed">
                    주식회사 퍼펙트PC통신은 서비스 이용에 필요한 최소한의 개인정보를 수집합니다. 이용자의 개인정보와 서비스 방문 및 검색, 서비스 이용을 통해 이용자의 관심, 흥미, 기호 등을 분석하여 개인 성향에 맞춤화 된 서비스를 제공하고 이용자가 원하는 시간, 장소에 맞게 서비스를 제안하는 생활 밀착형 서비스 이용 경험을 제공합니다.
                </p>
                
                <div class="overflow-x-auto mb-4">
                    <table class="w-full text-xs border-collapse border border-gray-300">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border border-gray-300 px-2 py-2">분류</th>
                                <th class="border border-gray-300 px-2 py-2">목적</th>
                                <th class="border border-gray-300 px-2 py-2">항목</th>
                                <th class="border border-gray-300 px-2 py-2">보유 및 이용기간</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2 font-semibold" rowspan="3">필수 정보</td>
                                <td class="border border-gray-300 px-2 py-2">회원 가입 및 관리, 서비스 상담 및 계약, 신청내역 확인</td>
                                <td class="border border-gray-300 px-2 py-2">이름, 연락처(휴대전화번호), 생년월일, 성별, 닉네임, 가입채널, 통신사 정보, 통신사 주소, 주소, 상호, 사업자번호, 서비스 이용을 위한 신청정보</td>
                                <td class="border border-gray-300 px-2 py-2">개인정보의 수집 또는 제공받는 목적이 달성시까지(단, 관계 법령에 따라 보존이 필요한 경우에는 해당 기간까지 보관한 후 파기)</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2">사용료 자동이체 및 사은품 지급</td>
                                <td class="border border-gray-300 px-2 py-2">이름, 연락처(휴대폰전화번호), 생년월일, 성별, 닉네임, 가입채널, 통신사 정보, 주소, 상호, 사업자 번호, 서비스 이용을 위한 신청정보, 계좌번호</td>
                                <td class="border border-gray-300 px-2 py-2">개인정보의 수집 또는 제공받는 목적이 달성되면 파기(단, 사은품 반환사유가 있을 경우 사은품 반환절차가 완료될 때까지)</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2">부정 이용 방지</td>
                                <td class="border border-gray-300 px-2 py-2">서비스 이용 기록, 부정 행위 기록, 녹취 파일</td>
                                <td class="border border-gray-300 px-2 py-2">부정 이용 행위의 중단 및 관련 민원이나 피해의 해결시까지</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2 font-semibold" rowspan="2">자동 수집 정보</td>
                                <td class="border border-gray-300 px-2 py-2">인구통계 정보 및 서비스 이용 이력을 바탕으로 개인화된 마케팅 활동에 활용</td>
                                <td class="border border-gray-300 px-2 py-2">이메일, 서비스 이용 내용, 상담정보, 광고 전송/반응 정보, 프로모션/이벤트</td>
                                <td class="border border-gray-300 px-2 py-2">개인정보의 수집 또는 제공받는 목적이 달성되면 파기(단, 관계 법령에 따라 보존이 필요한 경우에는 해당 기간까지 보관한 후 파기)</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2"></td>
                                <td class="border border-gray-300 px-2 py-2">접속로그(IP 포함), 쿠키, 서비스이용기록(로그인, 동의 여부, 조회 이력, 기기정보 등)</td>
                                <td class="border border-gray-300 px-2 py-2">개인정보의 수집 또는 제공받는 목적이 달성되면 파기(단, 관계 법령에 따라 보존이 필요한 경우에는 해당 기간까지 보관한 후 파기)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <p class="text-xs text-gray-600 mb-4">
                    * 본 개인정보 수집은 원활한 서비스 가입 및 이용을 위해 진행되고 있으며, 개인정보 수집에 동의하지 않으실 경우 서비스의 가입 및 이용에 제약이 발생할 수 있습니다.
                </p>
                
                <p class="text-sm font-semibold">
                    본인은 주식회사 퍼펙트PC통신이 위와 같이 개인정보 필수 및 선택항목을 수집·이용하는 것에 동의합니다.
                </p>
            </div>
        `
    },
    {
        id: 'privacy_third_party',
        title: '개인정보 제3자 제공 및 활용 동의',
        required: true,
        content: `
            <div class="terms-content">
                <h3 class="text-lg font-bold mb-4">개인정보 제3자 제공 및 활용 동의</h3>
                <p class="mb-4 text-sm leading-relaxed">
                    주식회사 퍼펙트PC통신(이하 "퍼펙트PC통신"이라 합니다)는 이용자에게 사전 동의를 받은 범위 내에서만 개인정보를 제3자에게 제공합니다. 현재 퍼펙트PC통신이 이용자의 개인정보를 제공하는 제3자는 아래와 같습니다.
                </p>
                
                <h4 class="font-bold text-sm mb-2">1) 개인정보의 제3자 제공</h4>
                <div class="overflow-x-auto mb-4">
                    <table class="w-full text-xs border-collapse border border-gray-300">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border border-gray-300 px-2 py-2">제공받는 자</th>
                                <th class="border border-gray-300 px-2 py-2">제공 목적</th>
                                <th class="border border-gray-300 px-2 py-2">제공 정보</th>
                                <th class="border border-gray-300 px-2 py-2">보유 및 이용 기간</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2">인터넷 가입 업체, 휴대폰 가입 업체, 렌탈 가입 업체</td>
                                <td class="border border-gray-300 px-2 py-2">서비스 가입</td>
                                <td class="border border-gray-300 px-2 py-2">이름, 생년월일, 연락처, 이메일, 주소, 통신사 정보</td>
                                <td class="border border-gray-300 px-2 py-2">개인정보의 수집 또는 제공받는 목적이 달성되면 파기</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2">㈜케이티알파</td>
                                <td class="border border-gray-300 px-2 py-2">기프티콘 발송 및 당첨 처리, 고객 문의 대응</td>
                                <td class="border border-gray-300 px-2 py-2">휴대전화번호</td>
                                <td class="border border-gray-300 px-2 py-2">개인정보 수집 또는 제공 목적 달성 시 파기</td>
                            </tr>
                            <tr>
                        </tbody>
                    </table>
                </div>

                <h4 class="font-bold text-sm mb-2 mt-4">2) 개인정보의 처리위탁</h4>
                <p class="text-sm mb-2">퍼펙트PC통신은 원활한 서비스 제공과 효과적인 업무처리를 위하여 다음과 같이 개인정보를 처리 위탁하고 있습니다.</p>
                
                <div class="overflow-x-auto mb-4">
                    <table class="w-full text-xs border-collapse border border-gray-300">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border border-gray-300 px-2 py-2">구분</th>
                                <th class="border border-gray-300 px-2 py-2">수탁자</th>
                                <th class="border border-gray-300 px-2 py-2">위탁업무</th>
                                <th class="border border-gray-300 px-2 py-2">보유 및 이용기간</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2">전자 결제</td>
                                <td class="border border-gray-300 px-2 py-2">토스페이먼츠 주식회사</td>
                                <td class="border border-gray-300 px-2 py-2">전자 결제 대행</td>
                                <td class="border border-gray-300 px-2 py-2">관계 법령에 따른 보관의무 기간 또는 회원 탈퇴 및 위탁 계약 종료시까지</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2">알림 발송</td>
                                <td class="border border-gray-300 px-2 py-2">㈜카카오, ㈜스티비, 인포뱅크, ㈜다우기술, 문자박사, ㈜플루닛</td>
                                <td class="border border-gray-300 px-2 py-2">SMS/LMS 및 이메일, 알림톡, 친구톡 발송</td>
                                <td class="border border-gray-300 px-2 py-2">관계 법령에 따른 보관의무 기간 또는 회원 탈퇴 및 위탁 계약 종료시까지</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2">데이터 보관 및 DB관리</td>
                                <td class="border border-gray-300 px-2 py-2">Supabase Inc.</td>
                                <td class="border border-gray-300 px-2 py-2">데이터 저장 및 데이터베이스 관리</td>
                                <td class="border border-gray-300 px-2 py-2">관계 법령에 따른 보관의무 기간 또는 회원 탈퇴 및 위탁 계약 종료시까지</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2">웹 호스팅 및 배포</td>
                                <td class="border border-gray-300 px-2 py-2">Vercel Inc.</td>
                                <td class="border border-gray-300 px-2 py-2">서비스 배포 및 웹 호스팅 운영</td>
                                <td class="border border-gray-300 px-2 py-2">관계 법령에 따른 보관의무 기간 또는 회원 탈퇴 및 위탁 계약 종료시까지</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `
    },
    {
        id: 'unique_identifier',
        title: '고유식별정보 수집 및 처리 동의',
        required: true,
        content: `
            <div class="terms-content">
                <h3 class="text-lg font-bold mb-4">고유식별정보 수집 및 처리 동의</h3>
                <p class="mb-4 text-sm leading-relaxed">
                    본인은 ㈜퍼펙트PC통신(이하 '퍼펙트PC통신')가 서비스 가입 및 이용과 관련하여 「전기통신사업법」 제32조의4 및 동법 시행령 제37조의7 등에 따라 아래와 같이 최소한의 고유식별정보를 수집하거나 활용하는 데에 동의합니다.
                </p>
                
                <div class="overflow-x-auto mb-4">
                    <table class="w-full text-xs border-collapse border border-gray-300">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="border border-gray-300 px-2 py-2">목적</th>
                                <th class="border border-gray-300 px-2 py-2">구분</th>
                                <th class="border border-gray-300 px-2 py-2">수집항목</th>
                                <th class="border border-gray-300 px-2 py-2">보유 및 이용기간</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2" rowspan="2">서비스 가입 및 이용</td>
                                <td class="border border-gray-300 px-2 py-2" rowspan="2">본인 확인 및 부정이용 방지</td>
                                <td class="border border-gray-300 px-2 py-2">주민등록번호</td>
                                <td class="border border-gray-300 px-2 py-2">개인정보의 수집 또는 제공받는 목적이 달성되면 파기</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-300 px-2 py-2">외국인등록번호</td>
                                <td class="border border-gray-300 px-2 py-2">개인정보의 수집 또는 제공받는 목적이 달성되면 파기</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <p class="text-sm text-gray-600">
                    본인은 법률에 따른 고유식별정보의 수집 및 이용 등과 관련된 사항에 대해 원치 않는 경우 동의를 거부할 수 있습니다. 단, 본인이 동의를 거부하는 경우 서비스의 전부 또는 일부 이용이 제한될 수 있습니다.
                </p>
            </div>
        `
    },
    {
        id: 'marketing',
        title: '마케팅 정보 수신 동의',
        required: false,
        content: `
            <div class="terms-content">
                <h3 class="text-lg font-bold mb-4">마케팅 정보 수신 동의 (선택)</h3>
                <p class="mb-4 text-sm leading-relaxed">
                    주식회사 퍼펙트PC통신(이하 "회사")는 개인정보보호법 및 정보통신망이용촉진 및 정보보호등에 관한 법률 등 관계법령에 따라 광고성 정보를 전송하기 위해 이용자의 사전 수신동의를 받고 수신 여부를 정기적으로 확인하고 있습니다.
                </p>
                
                <h4 class="font-bold text-sm mb-2">1. 수집하는 마케팅 정보 항목</h4>
                <ul class="list-disc list-inside mb-3 text-sm">
                    <li>필수항목: 성명, 연락처, 이메일</li>
                </ul>
                
                <h4 class="font-bold text-sm mb-2">2. 마케팅 정보 수집방법</h4>
                <p class="mb-3 text-sm">홈페이지에서 회원가입 또는 상담신청 화면을 통해 이용자가 직접 입력 및 저장하는 정보 수집</p>
                
                <h4 class="font-bold text-sm mb-2">3. 마케팅 정보의 수집 및 이용목적</h4>
                <p class="mb-3 text-sm">신제품 및 이벤트 안내, 이벤트 경품/사은품 제공, 할인행사, 고객 맞춤 마케팅/판촉 관련 TM 및 SMS 발송</p>
                
                <h4 class="font-bold text-sm mb-2">4. 수신동의변경 및 보유시간</h4>
                <ul class="list-disc list-inside mb-3 text-sm space-y-1">
                    <li>이용자는 회사 정보수정 페이지 또는 고객센터에서 개별서비스의 마케팅 수신동의를 변경(동의/철회)할 수 있습니다.</li>
                    <li>동의일로부터 회원 탈퇴 혹은 마케팅 수신 동의 해제 시까지 광고성 정보 전달을 위하여 보유ㆍ이용 됩니다.</li>
                </ul>
                
                <h4 class="font-bold text-sm mb-2">5. 철회안내</h4>
                <p class="mb-3 text-sm">
                    이용자는 수신동의 이후에라도 언제든지 동의를 철회할 수 있으며, 수신을 동의하지 않아도 회사가 제공하는 기본적인 서비스를 이용하실 수 있습니다. 다만, 수신 거부할 경우 신규 서비스나 상품 관련 소식 등의 마케팅 정보를 제공받지 못할 수 있습니다.
                </p>
                
                <p class="text-xs text-orange-600 bg-orange-50 p-3 rounded">
                    ※ 귀하께서는 마케팅 수집·이용에 대한 동의를 거부하실 수 있으나, 동의를 거부하실 경우 마케팅 관련 서비스 제공이 제한될 수 있음을 알려드립니다.
                </p>
            </div>
        `
    }
];

export type AgreementState = {
    [K in (typeof TERMS)[number]['id']]: boolean;
};

export const getInitialAgreementState = (): AgreementState => {
    return TERMS.reduce((acc, term) => {
        acc[term.id as keyof AgreementState] = false;
        return acc;
    }, {} as AgreementState);
};

export const areAllRequiredAgreed = (agreements: AgreementState): boolean => {
    return TERMS.filter(t => t.required).every(term => agreements[term.id as keyof AgreementState]);
};

export const areAllAgreed = (agreements: AgreementState): boolean => {
    return TERMS.every(term => agreements[term.id as keyof AgreementState]);
};
