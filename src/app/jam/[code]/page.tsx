import { use } from 'react';
import JamView from '@/components/JamView';

interface PageProps {
    params: Promise<{ code: string }>;
}

export default function JamPage({ params }: PageProps) {
    // Next.js 15+ Params are promises
    const resolveParams = use(params);
    const { code } = resolveParams;

    return <JamView jamCode={code} />;
}
