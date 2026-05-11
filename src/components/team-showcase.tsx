import { TeamMember } from './team-member';

const teamMembers = [
  {
    name: 'Dadapeer K',
    role: 'Full Stack Developer',
    description: 'Lead developer and architect of Vyapaar Sahayak, specializing in AI integration and system design.',
    imagePath: '/team/dadapeer.jpg'
  },
  {
    name: 'Apeksha C Rao',
    role: 'UI/UX Designer',
    description: 'Creative lead responsible for the intuitive user experience and modern design aesthetics.',
    imagePath: '/team/apeksha.jpg'
  },
  {
    name: 'Amrutha BR',
    role: 'Backend Developer',
    description: 'Core backend developer focusing on data security and business logic implementation.',
    imagePath: '/team/amrutha.jpg'
  }
];

export function TeamShowcase() {
  return (
    <section className="py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {teamMembers.map((member, index) => (
          <TeamMember
            key={member.name}
            {...member}
            delay={index * 0.2}
          />
        ))}
      </div>
    </section>
  );
}