// src/pages/Home.jsx
import React from 'react';

function Home() {
    return (
        <div className="container mx-auto px-4 py-12 text-text">
            {/* Header Section */}
            <header className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4">Welcome to Fleeting Fascinations</h1>
                <p className="text-lg text-subtext1">
                    Discover a world of captivating insights and inspirations.
                </p>
            </header>

            {/* Introduction Section */}
            <section className="bg-surface1 p-8 rounded-lg shadow-md mb-12 text-center">
                <h2 className="text-3xl font-semibold text-accent mb-4">Explore Endless Possibilities</h2>
                <p className="text-lg leading-relaxed text-subtext0">
                    Dive deep into topics that spark your curiosity. Whether it's technology, design, or innovation, we bring you closer to what you love.
                </p>
            </section>

            {/* Features Section */}
            <section className="mb-12">
                <h2 className="text-3xl font-semibold text-center mb-8">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-surface0 p-6 rounded-lg shadow-md text-center">
                        <h3 className="text-2xl font-bold text-accent mb-4">In-Depth Articles</h3>
                        <p className="text-subtext1">
                            Our articles dive deep into the topics you’re passionate about, giving you fresh insights and perspectives.
                        </p>
                    </div>
                    {/* Feature 2 */}
                    <div className="bg-surface0 p-6 rounded-lg shadow-md text-center">
                        <h3 className="text-2xl font-bold text-accent mb-4">Latest News</h3>
                        <p className="text-subtext1">
                            Stay up-to-date with the latest happenings in your fields of interest with curated news highlights.
                        </p>
                    </div>
                    {/* Feature 3 */}
                    <div className="bg-surface0 p-6 rounded-lg shadow-md text-center">
                        <h3 className="text-2xl font-bold text-accent mb-4">Interactive Community</h3>
                        <p className="text-subtext1">
                            Connect with like-minded individuals, share your thoughts, and be part of a vibrant community.
                        </p>
                    </div>
                </div>
            </section>

            {/* Call-to-Action Section */}
            <section className="text-center">
                <h2 className="text-3xl font-semibold mb-4">Join Us Today</h2>
                <p className="text-lg text-subtext0 mb-8">
                    Don’t miss out on fascinating content tailored to your interests. Be a part of our growing community!
                </p>
                <button className="px-8 py-4 bg-accent text-surface0 font-bold rounded-md hover:bg-opacity-90 transition duration-200">
                    Get Started
                </button>
            </section>
        </div>
    );
}

export default Home;
