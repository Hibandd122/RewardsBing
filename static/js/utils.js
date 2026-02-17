import { termLists, formParams } from './config.js';

export const randomTerm = (usedTerms = new Set()) => {
    if (usedTerms.size > termLists.flat().length * 0.8) {
        const list = termLists[Math.floor(Math.random() * termLists.length)];
        return list[Math.floor(Math.random() * list.length)];
    }
    let term;
    do {
        const list = termLists[Math.floor(Math.random() * termLists.length)];
        term = list[Math.floor(Math.random() * list.length)];
    } while (usedTerms.has(term));
    return term;
};

export const randomForm = () => formParams[Math.floor(Math.random() * formParams.length)];

export const toClockFormat = (ms, showHours = false) => {
    if (ms < 0) ms = 0;
    const hrs = Math.floor(ms / (1000*60*60));
    const min = Math.floor(ms / (1000*60)) % 60;
    const sec = Math.floor(ms / 1000) % 60;
    if (showHours || hrs > 0) {
        return `${String(hrs).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    }
    return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
};

export const formatIndex = (current, total) => {
    const padLen = String(total).length;
    return String(current).padStart(padLen, '0');
};