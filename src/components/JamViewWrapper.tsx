import { useState, useEffect } from 'react';
import { Jam, Theme, Participation } from '@/types';
import JamView from '@/components/JamView';
import { Music2 } from 'lucide-react';

export default function JamViewWrapper(props: JamViewWrapperProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-black" suppressHydrationWarning />;
    }

    return (
        <div suppressHydrationWarning>
            <JamView {...props} />
        </div>
    );
}
