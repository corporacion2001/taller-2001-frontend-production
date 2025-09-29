import React from "react";
import Navbar from "./navBar/NavBar";
import HeroSection from "./heroSection/HeroSection";
import ServicesSection from "./servicesSection/ServicesSection";
import AboutSection from "./aboutSection/AboutSection ";
import ContactSection from "./locationSection/LocationSection";
import Footer from "./footer/Footer";
import WhatsAppButton from "../whatsappBotton/WhatsappBotton"
import "./homePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />

      <main>
        <section id="home">
          <HeroSection />
        </section>

        <section id="services">
          <ServicesSection />
        </section>

        <section id="about">
          <AboutSection />
        </section>

       {/* <section id="testimonials">
          <Testimonials />
        </section> */}

        <section id="contact">
          <ContactSection />
        </section>
      </main>

      <Footer />
      <WhatsAppButton></WhatsAppButton>
    </div>
  );
};

export default HomePage;
