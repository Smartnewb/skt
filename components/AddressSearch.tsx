'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface AddressSearchProps {
    onComplete: (data: {
        zonecode: string;
        address: string;
        buildingName?: string;
    }) => void;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ onComplete }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        // Daum Postcode script 로드
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handleSearch = () => {
        setIsOpen(true);

        // 스크립트 로드 후 실행
        setTimeout(() => {
            if (typeof window !== 'undefined' && (window as any).daum) {
                new (window as any).daum.Postcode({
                    oncomplete: function (data: any) {
                        // 주소 선택 시 콜백
                        onComplete({
                            zonecode: data.zonecode,
                            address: data.roadAddress || data.jibunAddress,
                            buildingName: data.buildingName,
                        });
                        setIsOpen(false);
                    },
                    onclose: function () {
                        setIsOpen(false);
                    },
                    width: '100%',
                    height: '100%',
                }).embed(document.getElementById('daum-postcode-container'));
            }
        }, 100);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Trigger asChild>
                <button
                    type="button"
                    onClick={handleSearch}
                    className="px-6 py-3.5 bg-gray-100 text-text-primary rounded-xl font-bold text-base hover:bg-gray-200 transition-all whitespace-nowrap"
                >
                    주소 검색
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[90vw] max-w-lg h-[80vh] max-h-[600px] overflow-hidden">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                        <Dialog.Title className="text-lg font-bold text-text-primary">
                            주소 검색
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                className="text-text-secondary hover:text-text-primary"
                                onClick={() => setIsOpen(false)}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </Dialog.Close>
                    </div>
                    <div
                        id="daum-postcode-container"
                        className="w-full h-[calc(100%-64px)]"
                    />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default AddressSearch;
