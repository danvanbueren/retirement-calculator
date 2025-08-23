'use client';
import React from 'react';
import ChronologicalDataDisplay from '@/components/ChronologicalDataDisplay';
import Sidebar from "@/components/Sidebar";

export default function Page() {
    return (
        <>
            <Sidebar>
                <ChronologicalDataDisplay />
            </Sidebar>
        </>
    );
}
