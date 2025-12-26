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
          Building data platforms and AI systems that scale
        </p>
        <a
          href="#projects"
          className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
        >
          View Projects
        </a>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tournament Bot */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
              <div className="text-sm text-green-500 mb-2">● Live</div>
              <h3 className="text-xl font-semibold mb-2">Tournament Bot</h3>
              <p className="text-gray-400 mb-4">
                Autonomous agentic AI that manages tournament logistics through natural language.
                Handles registration, scheduling, and bracket management.
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
              <h3 className="text-xl font-semibold mb-2">Inventory Management System</h3>
              <p className="text-gray-400 mb-4">
                Modernized retail POS for 15K SKUs. Parsed legacy data, integrated with Shopify for
                real-time inventory sync across physical and online stores.
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
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-gray-400 mb-4">
                Chat with an AI that knows my experience. Ask about my projects, skills, or
                background. Built with OpenAI API and rate limiting.
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">AI Assistant</h2>
          <p className="text-gray-400 text-center mb-8">
            Ask about my experience, skills, or projects!
          </p>
          <Chat />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-black">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">About</h2>
          <div className="text-gray-400 space-y-4 mb-8">
            <p>
              I am a data engineer and engineering leader with 10+ years of experience building data
              platforms, ML pipelines, and leading technical teams. I hold a Ph.D. in Physics from
              UC San Diego, where I worked on particle physics research at CERN.
            </p>
            <p>
              Currently, I am focused on building AI-powered applications and exploring how large
              language models can automate complex workflows. I have built production systems
              processing 500M+ rows and delivering $10M+ in annual revenue.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-4">Tech Stack</h3>
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
              "Redis",
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
            <h3 className="text-xl font-semibold mb-6 text-center">GitHub Activity</h3>
            <GitHubContributions />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Contact</h2>
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
