import React from 'react';

interface SectionProps {
  title: string;
  intro: string;
  paragraphs: string[];
  imageUrl?: string;
  imageAlt?: string;
}

const Terms: React.FC = () => {
  const sections: SectionProps[] = [
    {
      title: 'Terms of Service',
      intro: 'Disclosure for Educational and Ethical Purposes',
      paragraphs: [
        '1. Acceptance of Terms:',
        'By using this website, you agree to the following disclosure, which outlines the educational and ethical nature of the content provided. This disclosure may be updated at any time without prior notice.',
        '2. Nature of Content:',
        'This website offers access to a variety of educational resources, research tools, and information intended for ethical, educational, and research purposes. The content is not intended for commercial use.',
        '3. Educational Use:',
        'Unless explicitly specified, the materials and resources provided on this website are for educational purposes. The content is designed to inform, educate, and promote ethical considerations.',
        '4. Research and Development:',
        'The content on this website is a result of research and development efforts. It is intended to advance knowledge, understanding, and ethical practices in various fields.',
        '5. No Unlawful or Unethical Use:',
        'Users of this website must commit to using the content for lawful and ethical purposes. The materials and information should not be used in any way that violates the law or ethical principles.',
        '6. Termination/Access Restriction:',
        'We reserve the right to restrict or terminate access to our resources if they are used in an unlawful or unethical manner or for any other reason that we deem appropriate.',
        '7. Disclaimer:',
        'The information provided on this website is for educational and ethical purposes only. It should not be considered as professional advice or used as a substitute for expert guidance. We do not endorse or encourage any unethical or illegal activities.',
        '8. Changes to this Disclosure:',
        'We may update this disclosure to reflect changes in our educational and ethical policies. Users are encouraged to review this disclosure periodically.',
        'By using this website, you acknowledge that you have read, understood, and agreed to this disclosure.',
      ],
    },
  ];

  return (
    <div className="bg-gray-100 text-black min-h-screen p-6">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {sections.map((section, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
            <h4 className="text-xl mb-4">{section.intro}</h4>
            {section.paragraphs && (
              <div className="text-base text-gray-700">
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

export default Terms;
