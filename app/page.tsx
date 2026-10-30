import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { TechStack } from "@/components/sections/TechStack";
import { Works } from "@/components/sections/Works";

export default function Home() {
  return (
    <>
      <Hero />
      <Skills />
      <Works />
      <About />
      <TechStack />
      <Experience />
    </>
  );
}
