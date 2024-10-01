import React from 'react';

interface SectionProps {
  title: string;
  intro: string;
  paragraphs: string[];
}

const PrivacyPolicy: React.FC = () => {
  const sections: SectionProps[] = [
    {
      title: 'Privacy Policy',
      intro: 'Effective Date: 08/2024',
      paragraphs: [
        '1. Introduction:',
        'We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information about you when you visit and interact with our website, hosted on Vercel, and how we utilize analytics services.',
        '2. Information We Collect:',
        'We do not collect personal information such as your name, email address, or phone number unless you voluntarily provide it to us (e.g., through contact forms or account registration).',
        'We may collect non-personal information that does not directly identify you. This includes information such as your browser type, device information, IP address, and pages visited. This information is collected through cookies and other tracking technologies.',
        '3. How We Use Your Information:',
        'We use the information we collect to understand how users interact with our website and to improve the functionality and user experience.',
        'We use third-party analytics services such as Vercel Analytics to collect and analyze information about how our website is used. These services help us monitor website traffic, performance, and user interactions. Vercel may collect information such as your IP address, browser type, device information, and the pages you visit on our website. This data is anonymized and aggregated to provide insights without identifying individual users.',
        '4. Cookies and Tracking Technologies:',
        'Our website uses cookies and similar tracking technologies to collect information about your interactions with our site. Cookies are small data files stored on your device that help us improve our services and provide a better user experience.',
        'You can control and manage cookies through your browser settings. Please note that disabling cookies may affect your ability to use certain features of our website.',
        '5. How We Share Your Information:',
        'We do not sell, trade, or otherwise transfer your personal information to third parties. However, we may share non-personal information with third-party service providers, such as analytics services, to help us analyze website traffic and improve our services.',
        '6. Data Security:',
        'We take reasonable measures to protect the information we collect from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
        '7. Changes to This Privacy Policy:',
        'We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we make changes, we will update the effective date at the top of this policy.',
        '8. Contact Us:',
        'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at [Your Contact Information].',
      ],
    },
  ];

  return (
    <div className="bg-neorange text-black min-h-screen p-6">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {sections.map((section, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
            <h4 className="text-xl font-bold mb-4">{section.intro}</h4>
            {section.paragraphs && (
              <div className="text-base text-neorange">
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
