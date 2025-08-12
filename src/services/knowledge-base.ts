'use server';
/**
 * @fileOverview A mock knowledge base service for providing medical information.
 * In a real-world application, this would connect to a reliable, vetted medical database.
 */

// MOCK DATA - Replace with a proper medical knowledge base
const medicalKnowledge = [
    {
        keywords: ['জ্বর', 'মাথাব্যথা', 'শরীর ব্যথা', 'সর্দি', 'কাশি'],
        diagnosis: 'সাধারণ ফ্লু (Viral Flu)',
        careActions: 'বিশ্রাম নিন, প্রচুর তরল পান করুন (যেমন পানি, স্যুপ), এবং প্রয়োজন হলে প্যারাসিটামল গ্রহণ করুন।',
        diagnosticTests: 'সাধারণত কোনো পরীক্ষার প্রয়োজন নেই। লক্ষণ গুরুতর হলে ডাক্তারের পরামর্শ নিন।',
    },
    {
        keywords: ['পেট ব্যথা', 'বমি', 'ডায়রিয়া', 'পাতলা পায়খানা'],
        diagnosis: 'গ্যাস্ট্রোএন্টেরাইটিস (পেটের ইনফেকশন)',
        careActions: 'স্যালাইন (ORS) পান করুন। সহজপাচ্য খাবার যেমন জাউভাত বা কলা খান। তৈলাক্ত ও মসলাযুক্ত খাবার এড়িয়ে চলুন।',
        diagnosticTests: 'সাধারণত প্রয়োজন নেই। গুরুতর বা দীর্ঘস্থায়ী হলে মল পরীক্ষার পরামর্শ দেওয়া হতে পারে।',
    },
    {
        keywords: ['শ্বাসকষ্ট', 'বুকে ব্যথা', 'ঘন ঘন কাশি', 'কফ'],
        diagnosis: 'ব্রঙ্কাইটিস বা নিউমোনিয়ার লক্ষণ',
        careActions: 'অবিলম্বে ডাক্তারের কাছে যান। নিজে থেকে কোনো ওষুধ খাবেন না।',
        diagnosticTests: 'বুকের এক্স-রে (Chest X-ray), রক্ত পরীক্ষা (CBC)।',
    },
     {
        keywords: ['চোখ ওঠা', 'চোখ লাল', 'চোখ দিয়ে পানি পড়া', 'চোখে চুলকানি'],
        diagnosis: 'কনজাংটিভাইটিস (Conjunctivitis / Pink Eye)',
        careActions: 'পরিষ্কার পানি দিয়ে চোখ পরিষ্কার করুন। কালো চশমা ব্যবহার করুন। হাত দিয়ে চোখ স্পর্শ করবেন না। ডাক্তারের পরামর্শ অনুযায়ী চোখের ড্রপ ব্যবহার করুন।',
        diagnosticTests: 'সাধারণত প্রয়োজন নেই, তবে গুরুতর হলে ডাক্তার দেখাতে হবে।',
    }
];

export interface MedicalInfo {
    diagnosis: string;
    careActions: string;
    diagnosticTests: string;
}

/**
 * Searches the mock knowledge base for medical information based on symptoms.
 * @param symptoms A string of symptoms in Bengali.
 * @returns A promise that resolves to an array of matching medical information or null.
 */
export async function searchKnowledgeBase(symptoms: string): Promise<MedicalInfo[] | null> {
    console.log(`Searching knowledge base for symptoms: ${symptoms}`);
    const searchKeywords = symptoms.split(/[\s,।]+/); // Split by space, comma, or danda
    
    const matchedInfo = medicalKnowledge.filter(entry =>
        entry.keywords.some(keyword => searchKeywords.includes(keyword))
    );

    if (matchedInfo.length > 0) {
        console.log(`Found ${matchedInfo.length} matches in knowledge base.`);
        return matchedInfo.map(({ diagnosis, careActions, diagnosticTests }) => ({
            diagnosis,
            careActions,
            diagnosticTests
        }));
    }
    
    console.log('No direct matches found in knowledge base.');
    return null;
}
