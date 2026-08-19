import { useState } from "react";
import Chat from "./Chat/Chat";
import Friends from "./Friends/Friends";

interface ChatWindowProps {
    onClose: () => void;
}

export default function MySidebar({ onClose } : ChatWindowProps)
{
    const [activeTab, setActiveTab] = useState<'chat' | 'friends'>('chat');

    return (
        <div className="fixed top-2 right-3 w-[20vw] h-[96.5vh] bg-teal-50 rounded-xl p-5 shadow-lg z-1000 flex flex-col">
            <div>
                <button
                    className="hover:bg-red-400 w-6 h-6 rounded-full font-bold font-stretch-150% 
                    cursor-pointer shadow-md shadow-red-400 absolute right-3 flex items-center justify-center"
                    onClick={onClose}>
                     x
                </button>
            </div>
            
            {/* Section Événements (30%) */}
            <div className="h-[30%] overflow-hidden border-b border-teal-200 pb-2">
                Event
            </div>

            {/* Section Chat / Amis (70%) avec onglets */}
            <div className="h-[70%] flex flex-col overflow-hidden pt-2">
                <div className="flex gap-2 mb-2 border-b border-teal-200 pb-1">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`text-sm font-bold pb-1 cursor-pointer transition-colors ${
                            activeTab === 'chat'
                                ? 'text-teal-700 border-b-2 border-teal-600'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`text-sm font-bold pb-1 cursor-pointer transition-colors ${
                            activeTab === 'friends'
                                ? 'text-teal-700 border-b-2 border-teal-600'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Amis
                    </button>
                </div>

                <div className="flex-1 overflow-hidden">
                    {activeTab === 'chat' ? <Chat /> : <Friends />}
                </div>
            </div>
        </div>
    );
}