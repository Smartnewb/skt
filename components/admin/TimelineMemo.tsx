'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MemoEntry {
    id: string;
    adminName: string;
    content: string;
    isPinned: boolean;
    callbackTime?: string;
    logType: 'memo' | 'status_change' | 'callback' | 'system';
    createdAt: string;
}

interface TimelineMemoProps {
    memos: MemoEntry[];
    onAddMemo: (content: string, callbackTime?: string) => void;
    onPinMemo?: (id: string, isPinned: boolean) => void;
    isLoading?: boolean;
}

export function TimelineMemo({ memos, onAddMemo, onPinMemo, isLoading }: TimelineMemoProps) {
    const [newMemo, setNewMemo] = React.useState('');
    const [showCallbackPicker, setShowCallbackPicker] = React.useState(false);
    const [callbackDate, setCallbackDate] = React.useState('');
    const [callbackTime, setCallbackTime] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemo.trim()) return;

        const callback = showCallbackPicker && callbackDate && callbackTime
            ? `${callbackDate}T${callbackTime}:00`
            : undefined;

        onAddMemo(newMemo, callback);
        setNewMemo('');
        setShowCallbackPicker(false);
        setCallbackDate('');
        setCallbackTime('');
    };

    const pinnedMemos = memos.filter(m => m.isPinned);
    const regularMemos = memos.filter(m => !m.isPinned);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'status_change': return '🔄';
            case 'callback': return '📞';
            case 'system': return '⚙️';
            default: return '💬';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Pinned Memos */}
            {pinnedMemos.length > 0 && (
                <div className="bg-yellow-50 border-b border-yellow-200 p-3">
                    <div className="text-xs text-yellow-800 font-semibold mb-2">📌 고정된 메모</div>
                    {pinnedMemos.map((memo) => (
                        <div key={memo.id} className="flex items-start justify-between mb-2 last:mb-0">
                            <div className="text-sm text-yellow-900 flex-1">{memo.content}</div>
                            {onPinMemo && (
                                <button
                                    onClick={() => onPinMemo(memo.id, false)}
                                    className="ml-2 text-yellow-600 hover:text-yellow-800 transition text-sm"
                                    title="고정 해제"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                    <div className="text-center text-gray-500 py-8">로딩 중...</div>
                ) : regularMemos.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        아직 메모가 없습니다.<br />
                        상담 내용을 기록해주세요.
                    </div>
                ) : (
                    regularMemos.map((memo, index) => (
                        <motion.div
                            key={memo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-lg">{getLogIcon(memo.logType)}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-gray-700">
                                            {memo.adminName}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {formatTime(memo.createdAt)}
                                        </span>
                                        {onPinMemo && memo.logType === 'memo' && (
                                            <button
                                                onClick={() => onPinMemo(memo.id, !memo.isPinned)}
                                                className="opacity-0 group-hover:opacity-100 text-xs hover:text-yellow-600 transition"
                                            >
                                                📌
                                            </button>
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-lg text-sm ${memo.logType === 'system'
                                        ? 'bg-gray-100 text-gray-600 italic'
                                        : 'bg-blue-50 text-gray-800'
                                        }`}>
                                        {memo.content}
                                        {memo.callbackTime && (
                                            <div className="mt-2 text-xs text-blue-600">
                                                📞 콜백 예정: {formatTime(memo.callbackTime)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-gray-50">
                {showCallbackPicker && (
                    <div className="flex gap-2 mb-3">
                        <input
                            type="date"
                            value={callbackDate}
                            onChange={(e) => setCallbackDate(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                            type="time"
                            value={callbackTime}
                            onChange={(e) => setCallbackTime(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                )}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowCallbackPicker(!showCallbackPicker)}
                        className={`px-3 py-2 rounded-lg text-sm transition ${showCallbackPicker
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        title="콜백 예약"
                    >
                        📞
                    </button>
                    <input
                        type="text"
                        value={newMemo}
                        onChange={(e) => setNewMemo(e.target.value)}
                        placeholder="상담 내용을 입력하세요..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={!newMemo.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        전송
                    </button>
                </div>
            </form>
        </div>
    );
}
