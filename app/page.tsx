import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { TechStack } from "@/components/sections/TechStack";
import { Works } from "@/components/sections/Works";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <Skills />
      <Works />
      <About />
      <TechStack />
      <Experience />
    </>
  );
}
