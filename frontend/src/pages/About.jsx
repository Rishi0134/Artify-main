import "./About.css";

const About = () => (
  <section className="section-block site-shell about-page">
    <div className="about-hero reveal">
      <span className="eyebrow">About Artify</span>
      <h1>Artify is a virtual gallery shaped like a premium digital museum.</h1>
      <p>
        The platform brings artists, collectors, and administrators into one curated
        environment built for discovery, commerce, and exhibition-quality presentation.
      </p>
    </div>

    <div className="about-story">
      <article className="glass-card reveal">
        <h2>Why it exists</h2>
        <p>
          Artify gives original work a calmer presentation layer. Dark surfaces, subtle
          lighting, and restrained interface chrome keep attention on the artwork rather
          than the surrounding controls.
        </p>
      </article>
      <article className="glass-card reveal">
        <h2>How it works</h2>
        <p>
          Artists upload work, collectors browse and purchase available pieces, and admins
          manage categories, orders, and accounts through dedicated dashboards.
        </p>
      </article>
    </div>

    <div className="glass-card reveal">
      <div className="about-stats">
        <div className="about-stat">
          <strong>Artists</strong>
          <span>Upload and exhibit original work</span>
        </div>
        <div className="about-stat">
          <strong>Collectors</strong>
          <span>Search, view, and order curated pieces</span>
        </div>
        <div className="about-stat">
          <strong>Admins</strong>
          <span>Maintain quality across the marketplace</span>
        </div>
      </div>
    </div>
  </section>
);

export default About;
