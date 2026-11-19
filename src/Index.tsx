

import { Link } from "react-router-dom";

// ============================================================================
// EVENT CATEGORIES
// ============================================================================

const events = [
  {
    title: "Wedding",
    desc: "Make your big day unforgettable.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=700",
  },
  {
    title: "Birthday",
    desc: "Celebrate another beautiful year.",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=700",
  },
  {
    title: "Anniversary",
    desc: "Celebrate love and togetherness.",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=700",
  },
  {
    title: "Jagran",
    desc: "Organize a memorable devotional event.",
    image:
      "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=700",
  },
];

// ============================================================================
// SERVICES
// ============================================================================

const services = [
  {
    icon: "🍽️",
    title: "Catering",
    desc: "Delicious food for every occasion.",
  },
  {
    icon: "🌸",
    title: "Decoration",
    desc: "Beautiful setups for your events.",
  },
  {
    icon: "📸",
    title: "Photography",
    desc: "Capture your precious moments.",
  },
  {
    icon: "🎵",
    title: "Music & DJ",
    desc: "Make every celebration lively.",
  },
  {
    icon: "💄",
    title: "Makeup",
    desc: "Look your best on your special day.",
  },
  {
    icon: "🏛️",
    title: "Venue Booking",
    desc: "Find the perfect event location.",
  },
];

// ============================================================================
// MAIN INDEX COMPONENT
// ============================================================================

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFCF7] text-stone-800">

      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}

      <section className="relative overflow-hidden py-16 lg:py-24">

        {/* Background Decorations */}

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl"></div>

        <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl"></div>

        {/* Main Hero Container */}

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">

          {/* Hero Content */}

          <div>

            <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-semibold text-orange-600">
              ✨ Every Occasion Deserves a Celebration
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Celebrate Every

              <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                Moment With UTSAV
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-stone-600 md:text-lg">
              From beautiful weddings to unforgettable birthdays,
              find everything you need to make your special moments
              extraordinary. Discover trusted event professionals
              and bring your celebrations to life!
            </p>

            {/* Hero Buttons */}

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                to="/signup"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-4 font-bold text-white shadow-lg shadow-orange-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Get Started →
              </Link>

              <a
                href="#events"
                className="rounded-xl border border-orange-200 bg-white px-7 py-4 font-bold text-orange-600 transition hover:bg-orange-50"
              >
                Explore Events
              </a>

            </div>

            {/* Hero Highlights */}

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-stone-500">

              <span>✓ Easy Planning</span>

              <span>✓ Multiple Services</span>

              <span>✓ One Platform</span>

            </div>

          </div>


          {/* Hero Image */}

          <div className="relative mx-auto w-full max-w-xl">

            <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-amber-200/50 blur-2xl"></div>

            <div className="relative overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl shadow-orange-200/50">

              <img
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1100"
                alt="Beautiful wedding celebration"
                className="h-[350px] w-full object-cover sm:h-[480px]"
              />

            </div>

            {/* Floating Memory Card */}

            <div className="absolute -bottom-6 -left-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-xl sm:-left-10">

              <p className="text-2xl">🎉</p>

              <p className="mt-1 font-bold text-stone-800">
                Make Memories
              </p>

              <p className="text-sm text-stone-500">
                Worth Celebrating!
              </p>

            </div>

            {/* Floating Special Moments Card */}

            <div className="absolute -right-3 top-10 rounded-2xl bg-white p-4 shadow-xl sm:-right-8">

              <p className="text-2xl">💖</p>

              <p className="mt-1 text-sm font-bold text-stone-800">
                Special Moments
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================================== */}
      {/* EVENT CATEGORIES */}
      {/* ================================================================== */}

      <section
        id="events"
        className="scroll-mt-24 bg-white py-20"
      >

        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">

          {/* Section Heading */}

          <div className="text-center">

            <span className="font-semibold uppercase tracking-[3px] text-orange-500">
              Explore Occasions
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 md:text-4xl">
              Every Celebration Has a Story
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-stone-500">
              Whatever the occasion, UTSAV helps you find the
              right services to make it truly special.
            </p>

          </div>


          {/* Event Cards */}

          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">

            {events.map((event) => (

              <div
                key={event.title}
                className="group overflow-hidden rounded-2xl border border-orange-100 bg-[#FFFCF7] shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >

                <div className="h-52 overflow-hidden">

                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                </div>

                <div className="p-5">

                  <h3 className="text-xl font-bold text-stone-800">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    {event.desc}
                  </p>

                  <a
                    href="#services"
                    className="mt-5 inline-block font-semibold text-orange-600 transition hover:text-rose-600"
                  >
                    Explore Services →
                  </a>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================================================================== */}
      {/* OUR SERVICES */}
      {/* ================================================================== */}

      <section
        id="services"
        className="scroll-mt-24 bg-[#FFF7ED] py-20"
      >

        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">

          {/* Section Heading */}

          <div className="text-center">

            <span className="font-semibold uppercase tracking-[3px] text-orange-500">
              Our Services
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 md:text-4xl">
              Everything You Need, In One Place
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-stone-500">
              Discover a variety of professional services
              to make your event perfect from beginning to end.
            </p>

          </div>


          {/* Service Cards */}

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {services.map((service) => (

              <div
                key={service.title}
                className="group rounded-2xl border border-orange-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl"
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 text-3xl transition group-hover:scale-110">
                  {service.icon}
                </div>

                <h3 className="mt-5 text-xl font-bold text-stone-800">
                  {service.title}
                </h3>

                <p className="mt-2 leading-7 text-stone-500">
                  {service.desc}
                </p>

                <a
                  href="#events"
                  className="mt-5 inline-block font-semibold text-orange-600 hover:text-rose-600"
                >
                  Discover More →
                </a>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================================================================== */}
      {/* HOW IT WORKS */}
      {/* ================================================================== */}

      <section
        className="scroll-mt-24 bg-white py-20"
        id="how-it-works"
      >

        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">

          {/* Section Heading */}

          <div className="text-center">

            <span className="font-semibold uppercase tracking-[3px] text-orange-500">
              Simple Process
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 md:text-4xl">
              How UTSAV Works
            </h2>

            <p className="mt-4 text-stone-500">
              Planning your dream event has never been easier.
            </p>

          </div>


          {/* Steps */}

          <div className="mt-14 grid gap-10 md:grid-cols-3">

            {[
              {
                number: "01",
                icon: "🎯",
                title: "Choose Your Event",
                desc: "Select your occasion and tell us what you are planning.",
              },
              {
                number: "02",
                icon: "🤝",
                title: "Explore Services",
                desc: "Find professional vendors and select the services you need.",
              },
              {
                number: "03",
                icon: "🥳",
                title: "Celebrate & Enjoy",
                desc: "Bring everything together and enjoy your special moments.",
              },
            ].map((step) => (

              <div
                key={step.number}
                className="relative text-center"
              >

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-rose-100 text-4xl shadow-md">
                  {step.icon}
                </div>

                <span className="mt-5 inline-block font-bold tracking-widest text-orange-500">
                  STEP {step.number}
                </span>

                <h3 className="mt-3 text-xl font-bold text-stone-800">
                  {step.title}
                </h3>

                <p className="mx-auto mt-3 max-w-xs leading-7 text-stone-500">
                  {step.desc}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================================================================== */}
      {/* CALL TO ACTION */}
      {/* ================================================================== */}

      <section className="py-16">

        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">

          <div className="relative mx-auto overflow-hidden rounded-[2rem] bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-7 py-16 text-center shadow-xl shadow-orange-200 md:px-16">

            {/* Background Decorations */}

            <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10"></div>

            <div className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full border-[35px] border-white/10"></div>

            <div className="relative">

              <span className="text-4xl">🎊</span>

              <h2 className="mt-5 text-3xl font-extrabold text-white md:text-5xl">
                Your Celebration Starts Here!
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-8 text-orange-50">
                Don't just plan an event, create memories that
                last forever. Join UTSAV and make every moment
                worth celebrating.
              </p>

              <Link
                to="/signup"
                className="mt-8 inline-block rounded-xl bg-white px-9 py-4 font-bold text-orange-600 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-orange-50"
              >
                Join UTSAV Today →
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}

      <footer className="bg-[#292524] pb-6 pt-16 text-stone-300">

        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">

          <div className="grid gap-12 border-b border-stone-700 pb-12 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}

            <div>

              <h2 className="text-3xl font-extrabold tracking-wide text-white">
                UTSAV<span className="text-orange-400">.</span>
              </h2>

              <p className="mt-3 font-medium text-orange-300">
                Celebrate Every Moment
              </p>

              <p className="mt-5 max-w-xs text-sm leading-7 text-stone-400">
                Your one-stop destination for planning
                beautiful events and finding the perfect
                services for every celebration.
              </p>

            </div>


            {/* Quick Links */}

            <div>

              <h3 className="mb-5 text-lg font-bold text-white">
                Quick Links
              </h3>

              <div className="flex flex-col gap-3 text-sm text-stone-400">

                <a
                  href="#events"
                  className="transition hover:text-orange-400"
                >
                  Explore Events
                </a>

                <a
                  href="#services"
                  className="transition hover:text-orange-400"
                >
                  Our Services
                </a>

                <Link
                  to="/login"
                  className="transition hover:text-orange-400"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="transition hover:text-orange-400"
                >
                  Sign Up
                </Link>

              </div>

            </div>


            {/* Services */}

            <div>

              <h3 className="mb-5 text-lg font-bold text-white">
                Our Services
              </h3>

              <div className="flex flex-col gap-3 text-sm text-stone-400">

                <span>Catering</span>
                <span>Decoration</span>
                <span>Photography</span>
                <span>Venue Booking</span>
                <span>Music & DJ</span>

              </div>

            </div>


            {/* Contact */}

            <div>

              <h3 className="mb-5 text-lg font-bold text-white">
                Get In Touch
              </h3>

              <div className="flex flex-col gap-4 text-sm text-stone-400">

                <p>📧 Email: support@utsav.com</p>
                <p>📍 India</p>
                <p>🎉 Making Every Celebration Special</p>

              </div>

            </div>

          </div>


          {/* Copyright */}

          <div className="flex flex-col items-center justify-between gap-4 pt-7 text-center text-sm text-stone-500 md:flex-row">

            <p>
              © {new Date().getFullYear()} UTSAV. All Rights Reserved.
            </p>

            <p>
              Made with ❤️ for Every Celebration
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Index;
