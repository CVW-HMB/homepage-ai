import GitHubContributions from "@/components/GitHubContributions";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">Vince Welke, Ph.D.</h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-2">Engineering Leader</p>
        <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl">
          Building high-performing teams and scalable data platforms
        </p>
        <a
          href="#projects"
          className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
        >
          View Projects
        </a>
      </section>

      {/* How I Work Section */}
      <section className="py-24 px-6 bg-black border-b border-zinc-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">How I Work</h2>
          <div className="space-y-6 text-gray-400">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                I focus on making the team more effective.
              </h3>
              <p>
                I handle planning, OKRs, and coordination with product and sales. When I see a
                process that could be improved, I design a solution and get it into quarterly
                planning. I want engineers spending their time on work that actually moves the
                needle.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">I work alongside my team.</h3>
              <p>
                I stay involved in the technical work, but my job is to help the team solve
                problems, not solve everything myself. I delegate, give people room to own their
                solutions, and step in when it makes sense.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                I prioritize getting things done right.
              </h3>
              <p>
                I care about building quality products, delivering on time, and keeping customers
                happy. When something ships, I want the team to be proud of it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Projects</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            A few things I&#39;ve built recently. I learn by doing, so I&#39;m always working on
            something.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tournament Bot */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
              <div className="text-sm text-green-500 mb-2">● Live</div>
              <h3 className="text-xl font-semibold mb-2">Tournament Bot</h3>
              <p className="text-gray-400 mb-4">
                An AI agent that runs gaming tournaments end-to-end. Players register, get matched,
                receive reminders, and check standings, all through natural conversation.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Claude API</span>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Railway</span>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Python</span>
              </div>
            </div>

            {/* Inventory System */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
              <div className="text-sm text-gray-500 mb-2">● Completed</div>
              <h3 className="text-xl font-semibold mb-2">Retail Inventory Overhaul</h3>
              <p className="text-gray-400 mb-4">
                Helped a local retailer modernize their POS. Migrated their product catalog to
                Shopify with real-time sync between their physical store and online shop.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">JavaScript</span>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Google Apps Script</span>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Shopify</span>
              </div>
            </div>

            {/* AI Assistant */}
            <a
              href="#assistant"
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors block"
            >
              <div className="text-sm text-green-500 mb-2">● Live</div>
              <h3 className="text-xl font-semibold mb-2">This AI Assistant</h3>
              <p className="text-gray-400 mb-4">
                The chatbot below. It knows my background, projects, and can answer questions about
                my experience. Built it to learn the OpenAI API.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">OpenAI API</span>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Next.js</span>
                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">Vercel</span>
              </div>
              <span className="text-white text-sm font-medium">Try it below →</span>
            </a>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section id="assistant" className="py-24 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Ask Me Anything</h2>
          <p className="text-gray-400 text-center mb-8">
            Curious about my background? This AI knows my story. Go ahead, ask it something.
          </p>
          <Chat />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-black">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">About Me</h2>
          <div className="text-gray-400 space-y-4 mb-8">
            <p>
              I&#39;m an engineering leader based in San Diego. I&#39;ve spent the last decade
              building data platforms and leading the teams that ship them. Currently I&#39;m a Lead
              Data Engineer at DeepSync, where I manage a team building B2B identity solutions.
            </p>
            <p>
              Before that, I led a team at LiveRamp building ad measurement products, and built
              fraud detection models at FICO. I started my career as a physicist, earning a PhD from
              UC San Diego and spending five years doing research at CERN in Switzerland. That
              experience taught me how to tackle problems that don&#39;t have obvious solutions, and
              how to work with distributed teams across the world.
            </p>
            <p>
              I&#39;ve spent a decade learning what makes great teams work. I&#39;m looking forward
              to the next decade and beyond to see how far I can take it.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-4">What I Work With</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              "Python",
              "SQL",
              "AWS",
              "Spark",
              "Airflow",
              "TypeScript",
              "Next.js",
              "OpenAI API",
              "Claude API",
              "PostgreSQL",
              "Docker",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="text-center">
            <a
              href="/Vince_Welke_Resume.pdf"
              className="inline-block px-6 py-3 border border-white rounded-full hover:bg-white hover:text-black transition-colors"
            >
              Download Resume
            </a>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6 text-center">Recent Activity</h3>
            <GitHubContributions />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact</h2>
          <p className="text-gray-400 mb-8">Interested in working together? Get in touch.</p>
          <div className="flex justify-center gap-6">
            <a
              href="mailto:vince.welke@gmail.com"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Email
            </a>
            <a
              href="https://linkedin.com/in/vince-welke"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/CVW-HMB"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-900 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Vince Welke
      </footer>
    </main>
  );
}
