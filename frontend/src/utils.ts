import { TOPIC_LIST } from './constants';
import { VocabularyItem } from './types';

export const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const selectRandomWords = (count: number): VocabularyItem[] => {
    const allWords = TOPIC_LIST.flatMap(topic => topic.vocabulary);
    const shuffled = allWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};