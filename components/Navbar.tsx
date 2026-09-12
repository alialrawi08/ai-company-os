export default function Navbar() {
  return (
    <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-8 py-8">
      <h1 className="text-2xl font-bold tracking-tight">
        AI Company OS
      </h1>

      <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
        <a
          href="#"
          className="transition hover:text-white"
        >
          Features
        </a>

        <a
          href="#"
          className="transition hover:text-white"
        >
          Solutions
        </a>

        <a
          href="#"
          className="transition hover:text-white"
        >
          Pricing
        </a>

        <a
          href="#"
          className="transition hover:text-white"
        >
          Contact
        </a>
      </div>

      <button className="rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl transition hover:bg-white hover:text-black">
        Login
      </button>
    </nav>
  );
}