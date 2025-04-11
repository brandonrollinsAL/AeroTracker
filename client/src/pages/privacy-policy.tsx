import React from "react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-burgundy-gold">Privacy Policy</h1>
      
      <div className="prose prose-lg prose-slate max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-burgundy-gold">Introduction</h2>
          <p>
            AeroTracker ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your information 
            when you use our flight tracking platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-burgundy-gold">Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Account Information:</strong> When you register, we collect your username, 
              email address, and encrypted password.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect information about how you interact with our 
              platform, including your search history, preferred routes, and favorite airports.
            </li>
            <li>
              <strong>Device Information:</strong> We collect information about the device and 
              browser you use to access our platform.
            </li>
            <li>
              <strong>Location Data:</strong> With your consent, we may collect your geographical 
              location to provide relevant flight information.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-burgundy-gold">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide and maintain our flight tracking service</li>
            <li>To authenticate you and secure your account</li>
            <li>To personalize your experience with relevant flight data</li>
            <li>To improve our platform based on user feedback and usage patterns</li>
            <li>To communicate with you about service updates and new features</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-burgundy-gold">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your 
            personal data against unauthorized or unlawful processing, accidental loss, 
            destruction, or damage. User passwords are stored using strong one-way hashing 
            algorithms with salt.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-burgundy-gold">Your Rights</h2>
          <p>Under applicable data protection laws, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Rectify inaccurate personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Restrict or object to the processing of your personal data</li>
            <li>Request the transfer of your data to another entity</li>
            <li>Withdraw consent at any time where we rely on consent to process your data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-burgundy-gold">Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience, 
            analyze usage patterns, and collect information about how you interact with our platform. 
            You can control cookies through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-burgundy-gold">Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, 
            please contact us at privacy@aerotracker.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-burgundy-gold">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          <p className="mt-2">
            <strong>Last Updated:</strong> April 11, 2025
          </p>
        </section>
      </div>
      
      <div className="mt-10 mb-6">
        <Link href="/">
          <a className="text-burgundy-gold hover:text-burgundy-gold-hover underline">
            Return to Home
          </a>
        </Link>
      </div>
    </div>
  );
}