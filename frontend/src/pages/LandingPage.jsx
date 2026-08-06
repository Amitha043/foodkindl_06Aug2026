import {
  ArrowRight,
  ChefHat,
  Heart,
  MapPin,
  MessageCircle,
  PackageCheck,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCheck,
  Users,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import SectionHeading from "../components/SectionHeading";
import StatCard from "../components/StatCard";

const steps = [
  {
    icon: <Users />,
    number: "01",
    title: "Discover People Nearby",
    text: "Create your profile, set dietary preferences, and discover food enthusiasts in your locality.",
  },
  {
    icon: <Send />,
    number: "02",
    title: "Send a Food Invite",
    text: "Choose the date, menu, cuisine, and venue, then invite a member of the community.",
  },
  {
    icon: <Utensils />,
    number: "03",
    title: "Cook, Meet, or Dine",
    text: "Meet at a public venue or host a verified gathering and enjoy a fresh meal together.",
  },
  {
    icon: <Heart />,
    number: "04",
    title: "Build Local Community",
    text: "Share recipes and moments, rate experiences, and schedule your next culinary gathering.",
  },
];

export default function LandingPage() {
  // const [stats, setStats] = useState({
  //   members: 0,
  //   meals_shared: 0,
  //   waste_reduced_kg: 0,
  // });
  const [statsLoading, setStatsLoading] = useState(true);

//   useEffect(() => {
//   async function loadStats() {
//     try {
//       const response = await api.get("/stats/");
//       setStats(response.data);
//     } catch (error) {
//       console.error(
//         "Unable to load statistics:",
//         error.response?.data || error
//       );
//     } finally {
//       setStatsLoading(false);
//     }
//   }

//   loadStats();

//   const intervalId = setInterval(loadStats, 30000);

//   return () => clearInterval(intervalId);
// }, []);

  const [waitlist, setWaitlist] = useState({ full_name: "", email: "", city: "" });
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactMessage, setContactMessage] = useState("");

  async function submitWaitlist(event) {
    event.preventDefault();
    try {
      await api.post("/website/waitlist/", waitlist);
      setWaitlistMessage("You are on the FoodKindl early-access list.");
      setWaitlist({ full_name: "", email: "", city: "" });
    } catch (error) {
      setWaitlistMessage(
        error.response?.data?.email?.[0] || "We could not add you right now."
      );
    }
  }

  async function submitContact(event) {
    event.preventDefault();
    try {
      await api.post("/website/contact/", contact);
      setContactMessage("Thank you. Your message has been received.");
      setContact({ name: "", email: "", subject: "", message: "" });
    } catch {
      setContactMessage("We could not send your message. Please try again.");
    }
  }

  return (
    <main>
      <section className="hero-section" id="connect">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-copy">
          <div className="status-pill">
            <span />
              Platform Now Live
          </div>

          <h1>
            Connect with people
            <br />
            Through <span>Food</span>
          </h1>

          <p>
            Cook together, share meals, reduce food waste, and discover
            sustainable food products—all in one human-centred platform.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" to="/register">
              Launch Connect App <ArrowRight size={18} />
            </Link>
            <a className="secondary-button" href="#how-it-works">
              How It Works
            </a>
          </div>
        </div>

        <div className="hero-visual">
  <div className="hero-floating-wrapper">
    <div className="hero-main-card">
      <img
        src="/images/food1.png"
        alt="Healthy FoodKindl meal"
        className="hero-main-image"
      />
    </div>

    <div className="hero-floating-image hero-floating-one">
      <img
        src="/images/food2.png"
        alt="Healthy meal"
      />
    </div>

    <div className="hero-floating-image hero-floating-two">
      <img
        src="/images/food3.png"
        alt="Fresh food bowl"
      />
    </div>
  </div>
</div>

        {/* <div className="stats-row">
          <StatCard
            value={statsLoading ? "..." : stats.members}
            label="Active members"
          />
          <StatCard
            value={statsLoading ? "..." : stats.meals_shared}
            label="Meals shared"
          />
          <StatCard
            value={
              statsLoading
                ? "..."
                : `${Number(stats.waste_reduced_kg || 0).toFixed(2)} kg`
            }
            label="Waste reduced"
          />
        </div> */}
      </section>

      <section className="content-section" id="how-it-works">
        <SectionHeading
          // eyebrow="Simple flow"
          title="How FoodKindl"
          accent="Works"
          description="In four simple steps, bring good food, shared laughter, and new friendships to your table."
        />

        <div className="feature-grid four">
          {steps.map((step) => (
            <article className="feature-card" key={step.number}>
              <div className="feature-top">
                <span className="icon-box">{step.icon}</span>
                <span className="step-number">{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <SectionHeading
          eyebrow="Product showcase"
          title="The"
          accent="FoodKindl App"
          description="A cinematic interface designed to coordinate menus, host gatherings, and spark real offline friendships."
        />

        <div className="phone-showcase">
          <div className="phone-tabs">
            <span className="active">Host Profile</span>
            <span>Food Invite</span>
            <span>Group Chat</span>
          </div>

          <div className="phone-shell">
            <div className="phone-notch" />
            <div className="profile-mini">
              <div className="avatar-mini">SJ</div>
              <div>
                <strong>Sarah Jenkins</strong>
                <small>UI Designer · 2.4 km away</small>
              </div>
            </div>
            <div className="tag-row">
              <span>Vegan</span><span>Italian Food</span><span>Weekend Host</span>
            </div>
            <div className="meal-photo">
              <Utensils size={42} />
              <strong>Mexican Taco Night</strong>
            </div>
            <p>
                Love cooking spices from scratch. Looking for clean eaters to
                co-cook and share ingredients this Sunday.
              </p>

              <div className="coming-soon-tag">
                🚀 Coming Soon
                <small>Mobile App Under Development</small>
              </div>

              <button disabled className="coming-soon-button">
                View Active Invites
              </button>
          </div>
        </div>

        <div className="story-block">
  <div>
    <div className="eyebrow left">
      Human-centric food platform
    </div>

    <h3>Social Dining, Simplified.</h3>

    <p>
      We believe the recipe to end isolation is simple: gathering
      around a kitchen counter, preparing a meal together, and sharing
      warm bread. FoodKindl coordinates the details so people can focus
      on building meaningful relationships.
    </p>
  </div>

  <div className="video-card">
    <video
      className="story-video"
      controls
      preload="metadata"
      poster="/images/video-thumbnail.jpg"
    >
      <source
        src="/videos/video1.mp4"
        type="video/mp4"
      />

      Your browser does not support the video tag.
    </video>

    {/* <div className="video-details">
      <small>2:40 min</small>
      <strong>Redefining Modern Hospitality</strong>
    </div> */}
  </div>
</div>
      </section>

      {/* <section className="content-section redistribution" id="food-service"> */}
        {/* <SectionHeading
          eyebrow="Zero waste protocol"
          title="Redistribution"
          accent="Engine"
          description="A high-efficiency pipeline connecting restaurants, caterers, and individuals with verified volunteers."
        /> */}

        {/* <div className="node-grid">
          <article className="node-card">
            <PackageCheck />
            <h3>Node 01: Producers</h3>
            <p>Restaurants, caterers, households, and event venues list safe surplus meals.</p>
          </article>
          <article className="node-card highlighted">
            <Truck />
            <h3>Node 02: Transit</h3>
            <p>Verified local volunteers coordinate timely pickup and responsible transport.</p>
          </article>
          <article className="node-card">
            <MapPin />
            <h3>Node 03: Delivery</h3>
            <p>Meals reach intended communities while freshness and dignity are protected.</p>
          </article>
        </div>
      </section> */}

      <section className="content-section safety">
        <div className="safety-intro">
          <div>
            <div className="eyebrow left">Safety first protocol</div>
            <h2>Trust &amp; <span>Safety Engine</span></h2>
          </div>
          <p>
            Connecting with new people should never compromise peace of mind.
            FoodKindl uses layered, proactive safeguards to build a verified
            and respectful cooking community.
          </p>
        </div>

        <div className="feature-grid three">
          <article className="feature-card">
            <UserCheck className="green" />
            <h3>Verified Profiles</h3>
            <p>Photo ID and mobile verification can be required before joining private gatherings.</p>
          </article>
          <article className="feature-card">
            <ShieldCheck />
            <h3>Women-Only Filters</h3>
            <p>Hosts can restrict selected gatherings to verified female community members.</p>
          </article>
          <article className="feature-card">
            <MessageCircle />
            <h3>One-Click SOS Shield</h3>
            <p>Emergency controls can share the active meetup location with trusted contacts.</p>
          </article>
        </div>
      </section>

      <section className="content-section products" id="products">
        <SectionHeading
          // eyebrow="Product vertical expansion"
          title="Future"
          accent="Vision"
          description="Cooking together is the starting point. FoodKindl can grow into a sustainable food and serveware ecosystem."
        />

        <div className="product-grid">

  <article className="product-card">
    <div className="product-image">
      <img
        src="/images/species.png"
        alt="FoodKindl Spices"
      />

      <div className="coming-overlay">
        Coming Soon
      </div>
    </div>

    <div>
      <h3>FoodKindl Spices</h3>

      <p>
        Curated spice bundles designed with local chefs to bring aroma,
        colour, and culinary stories into homes.
      </p>

      <small>Status: Planned Launch</small>
    </div>
  </article>

  <article className="product-card">
    <div className="product-image">
      <img
        src="/images/cermanic.png"
        alt="Sustainable Serveware"
      />

      <div className="coming-overlay">
        Coming Soon
      </div>
    </div>

    <div>
      <h3>Sustainable Serveware</h3>

      <p>
        Eco-conscious serving pieces made using clay, bamboo, and responsibly
        sourced materials.
      </p>

      <small>Status: Planned Launch</small>
    </div>
  </article>

</div>
      </section>

      {/* <section className="form-section" id="waitlist">
        <div className="form-card">
          <SectionHeading
            eyebrow="Exclusive reservation"
            title="Join the FoodKindl"
            accent="Community"
            description="Register for early access and secure your place in the local FoodKindl community."
          />

          <form onSubmit={submitWaitlist}>
            <div className="form-row">
              <label>
                Full name
                <input
                  value={waitlist.full_name}
                  onChange={(e) => setWaitlist({ ...waitlist, full_name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={waitlist.email}
                  onChange={(e) => setWaitlist({ ...waitlist, email: e.target.value })}
                  required
                  placeholder="johndoe@example.com"
                />
              </label>
            </div>

            <label>
              Select your city
              <input
                value={waitlist.city}
                onChange={(e) => setWaitlist({ ...waitlist, city: e.target.value })}
                required
                placeholder="Bengaluru"
              />
            </label>

            <button className="primary-button full">Get Early Access</button>
            {waitlistMessage && <p className="form-message">{waitlistMessage}</p>}
          </form>
        </div>
      </section> */}

      <section className="form-section contact-section" id="contact">
        <div className="form-card">
          <SectionHeading
            eyebrow="Reach out"
            title="Contact"
            accent="Us"
            description="Have a question, feedback, partnership idea, or community proposal? Send us a message."
          />

          <form onSubmit={submitContact}>
            <div className="form-row">
              <input
                placeholder="Your name"
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                required
              />
            </div>
            <input
              placeholder="Subject"
              value={contact.subject}
              onChange={(e) => setContact({ ...contact, subject: e.target.value })}
              required
            />
            <textarea
              placeholder="Your message"
              value={contact.message}
              onChange={(e) => setContact({ ...contact, message: e.target.value })}
              required
            />
            <button className="primary-button full">Send Message</button>
            {contactMessage && <p className="form-message">{contactMessage}</p>}
          </form>
        </div>
      </section>

      <footer>
  <div className="footer-brand">
    <img
      src="public/images/icon.png"
      alt="FoodKindl"
      className="footer-logo-image"
    />
  </div>
</footer>
    </main>
  );
}