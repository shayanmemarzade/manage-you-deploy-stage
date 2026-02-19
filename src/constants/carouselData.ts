// constants/carouselData.ts
import documentStorage from "@/assets/animations/documentStorageNew.json";
import expirationDate from "@/assets/animations/expirationDate.json";
import documentSharing from "@/assets/animations/documentSharing.json";
import educationTracking from "@/assets/animations/educationTracking.json";

export interface CarouselSlide {
    key: string;
    title: string;
    description: string;
    image: any; // You might want to type this more specifically based on your Lottie types
}

export const ONBOARDING_SLIDES: CarouselSlide[] = [
    {
        key: '1',
        title: 'Secure Document Storage',
        description: 'Keep your important documents safe with our certification and credential wallet. Store everything from licenses to diplomas securely in one place.',
        image: documentStorage,
    },
    {
        key: '2',
        title: 'Expiration Date Reminders',
        description: 'Keep your important documents safe with our certification and credential wallet. Store everything from licenses to diplomas securely in one place.',
        image: expirationDate,
    },
    {
        key: '3',
        title: 'Simple Document Sharing',
        description: 'Keep your important documents safe with our certification and credential wallet. Store everything from licenses to diplomas securely in one place.',
        image: documentSharing,
    },
    {
        key: '4',
        title: 'Easy Education Tracking',
        description: 'Keep your important documents safe with our certification and credential wallet. Store everything from licenses to diplomas securely in one place.',
        image: educationTracking,
    },
];