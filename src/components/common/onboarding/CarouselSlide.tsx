'use client'

import React, { useState, useEffect } from 'react';
import Lottie from "lottie-react";
import { CarouselSlide as SlideType } from '@/constants/carouselData';


interface CarouselSlideProps {
    slides: SlideType[];
    autoPlayInterval?: number;
    className?: string;
}

const CarouselSlide: React.FC<CarouselSlideProps> = ({
    slides,
    autoPlayInterval = 10000,
    className = ""
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);
        return () => clearInterval(timer);
    }, [autoPlayInterval, slides.length]);

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className="relative w-100 h-100 mb-4">
                <div className="w-100 h-96">
                    <div className="w-full h-full flex items-center justify-center">
                        <Lottie
                            animationData={slides[currentSlide].image}
                            loop={true}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-700 mb-8">
                {slides[currentSlide].title}
            </h2>

            {/* Carousel Dots */}
            <div className="flex space-x-2 cursor-pointer">
                {slides.map((_, index) => (
                    <div
                        onClick={() => setCurrentSlide(index)}
                        key={index}
                        className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default CarouselSlide;