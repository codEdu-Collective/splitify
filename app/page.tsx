import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight } from 'lucide-react';
import { FEATURES, STEPS, TESTIMONIALS } from '@/lib/landing';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
    return (
        <div className="flex flex-col pt-16">
            <section className="mt-20 pb-12 space-y-10 md:space-y-15 px-5">
                <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                        Split expenses and life smartly.
                    </Badge>

                    <h1 className="gradient-title mx-auto max-w-6xl text-4xl font-bold md:text-8xl">
                        Effortlessly split expenses with your friends
                    </h1>

                    <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">
                        Easily manage shared expenses, split bills with ease, and settle balances
                        quickly. Forget the hassle of keeping track of who owes what.
                    </p>
                    <div className="flex flex-col items-center gap-4 sm:flex-row justify-center">
                        <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                            <Link href="/dashboard">
                                Start Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                            <Link href="#how-it-works">Learn More</Link>
                        </Button>
                    </div>
                </div>

                <div className="container mx-auto max-w-5xl overflow-hidden rounded-xl shadow-xl">
                    <div className="gradient p-1 aspect-[16/9]">
                        <Image
                            src="/hero.png"
                            width={1280}
                            height={720}
                            alt="Banner"
                            className="rounded-lg mx-auto"
                            priority
                        />
                    </div>
                </div>
            </section>

            <section id="features" className="bg-gray-50 py-20">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                        Features
                    </Badge>
                    <h2 className="gradient-title mt-2 text-3xl md:text-4xl">
                        Everything you need to split expenses
                    </h2>
                    <p className="mx-auto mt-3 max-w-[700px] text-gray-500 md:text-xl/relaxed">
                        Our platform provides all the tools you need to handle shared expenses with
                        ease.
                    </p>

                    <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(({ title, Icon, bg, color, description }) => (
                            <Card
                                key={title}
                                className="flex flex-col items-center space-y-4 p-6 text-center"
                            >
                                <div className={`rounded-full p-3 ${bg}`}>
                                    <Icon className={`h-6 w-6 ${color}`} />
                                </div>

                                <h3 className="text-xl font-bold">{title}</h3>
                                <p className="text-gray-500">{description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="py-20">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                        How It Works
                    </Badge>
                    <h2 className="gradient-title mt-2 text-3xl md:text-4xl">
                        Splitting expenses has never been easier
                    </h2>
                    <p className="mx-auto mt-3 max-w-[700px] text-gray-500 md:text-xl/relaxed">
                        Follow these simple steps to start tracking and splitting expenses with
                        friends.
                    </p>

                    <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
                        {STEPS.map(({ label, title, description }) => (
                            <div key={label} className="flex flex-col items-center space-y-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600">
                                    {label}
                                </div>
                                <h3 className="text-xl font-bold">{title}</h3>
                                <p className="text-gray-500 text-center">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                        Testimonials
                    </Badge>
                    <h2 className="gradient-title mt-2 text-3xl md:text-4xl">
                        Hear from our users
                    </h2>

                    <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {TESTIMONIALS.map(({ quote, name, role, image }) => (
                            <Card key={name} className="flex flex-col justify-between">
                                <CardContent className="space-y-4 p-6">
                                    <p className="text-gray-500">{quote}</p>
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarImage src={image} alt={name} />
                                            <AvatarFallback className="uppercase">
                                                {name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">{name}</p>
                                            <p className="text-sm text-muted-foreground">{role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 gradient">
                <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
                    <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">
                        Want to make splitting expenses effortless?
                    </h2>
                    <p className="mx-auto max-w-[600px] text-green-100 md:text-xl/relaxed">
                        Join thousands who have made managing shared expenses simple and
                        stress-free.
                    </p>
                    <Button asChild size="lg" className="bg-green-800 hover:opacity-90">
                        <Link href="/dashboard">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            <footer className="border-t bg-gray-50 py-12 text-center text-sm text-muted-foreground">
                Made by ❤️ Split Smart.
            </footer>
        </div>
    );
}
