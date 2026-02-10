'use client';

import { Jam, Theme, Participation, User } from '@/types';
import JamView from '@/components/JamView';

interface JamViewWrapperProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUser?: User;
}

export default function JamViewWrapper(props: JamViewWrapperProps) {
    return <JamView {...props} />;
}
