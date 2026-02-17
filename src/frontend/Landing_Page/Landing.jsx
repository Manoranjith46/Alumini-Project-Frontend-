import React, { useState } from 'react';
import styles from './Landing.module.css';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Floating Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          {/* Logo */}
          <div className={styles.logoArea}>
             <div className={styles.sealIcon}>
                <span className="material-symbols-outlined">account_balance</span>
             </div>
             <div className={styles.logoText}>
                <span className={styles.logoKSRCE}>KSRCE</span>
                <span className={styles.logoAlumni}>ALUMNI</span>
             </div>
          </div>

          {/* Desktop Links */}
          <div className={styles.navLinks}>
            <a href="#home" className={styles.navLink}>HOME</a>
            <a href="#network" className={styles.navLink}>NETWORK</a>
            <a href="#events" className={styles.navLink}>EVENTS</a>
            <a href="#stories" className={styles.navLink}>SUCCESS</a>
          </div>

          {/* Action Button & Mobile Toggle */}
          <div className={styles.navActions}>
            <button className={styles.joinBtn}>JOIN PORTAL</button>
            <button className={styles.hamburgerBtn} onClick={toggleMobileMenu}>
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <a href="#home" className={styles.mobileNavLink}>HOME</a>
            <a href="#network" className={styles.mobileNavLink}>NETWORK</a>
            <a href="#events" className={styles.mobileNavLink}>EVENTS</a>
            <a href="#stories" className={styles.mobileNavLink}>SUCCESS</a>
            <button className={styles.mobileJoinBtn}>JOIN PORTAL</button>
          </div>
        )}
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className={styles.heroSection} id="home">
          <div className={styles.heroBadge}>
            <span className={styles.pingWrapper}>
              <span className={styles.pingDot}></span>
              <span className={styles.solidDot}></span>
            </span>
            GLOBAL NETWORK FOR EXCELLENCE
          </div>
          
          <h1 className={styles.heroTitle}>
            Connecting Generations,<br />
            Building Legacies
          </h1>
          
          <p className={styles.heroSubtitle}>
            A premium space where K.S.R.C.E. graduates unite to mentor, grow, 
            and lead the future of engineering across the globe.
          </p>

          <div className={styles.heroActions}>
            <button className={styles.btnPrimary}>Explore Directory</button>
            <button className={styles.btnSecondary}>Our Impact</button>
          </div>
        </section>

        {/* ALUMNI NETWORK SECTION */}
        <section className={styles.networkSection} id="network">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>The Alumni Network</h2>
              <div className={styles.titleUnderline}></div>
            </div>
          </div>

          <div className={styles.networkGrid}>
            {/* Main Feature Card */}
            <div className={`${styles.glassCard} ${styles.cardLarge}`}>
              <div>
                <div className={`${styles.cardIconBox} ${styles.iconBlue} ${styles.hoverScale}`}>
                  <span className="material-symbols-outlined">language</span>
                </div>
                <h3>Global Reach</h3>
                <p>
                  Connect with 15,000+ alumni across 40 countries. From Silicon Valley to European Innovation Hubs, our network spans the most influential tech ecosystems in the world.
                </p>
              </div>
              
              <div className={styles.avatarGroupRow}>
                 <div className={styles.avatarGroup}>
                    <div className={styles.avatarImg}></div>
                    <div className={styles.avatarImgAlt1}></div>
                    <div className={styles.avatarImgAlt2}></div>
                    <div className={styles.avatarMore}>+12k</div>
                 </div>
                 <span className={styles.avatarText}>ACTIVE MEMBERS</span>
              </div>
            </div>

            <div className={styles.networkCardColumn}>
              {/* Feature Card: Mentorship */}
              <div className={`${styles.glassCard} ${styles.cardHorizontal}`}>
                <div className={`${styles.cardIconBoxLg} ${styles.iconOrange}`}>
                  <span className="material-symbols-outlined">military_tech</span>
                </div>
                <div>
                  <h3 className={styles.mb2}>Mentorship Program</h3>
                  <p>A direct bridge between industry titans and the next generation of engineers.</p>
                </div>
              </div>
              
              <div className={styles.networkCardRow}>
                {/* Feature Card: Career Hub */}
                <div className={styles.glassCard}>
                  <div className={`${styles.cardIconBox} ${styles.iconBlue}`}>
                    <span className="material-symbols-outlined">business_center</span>
                  </div>
                  <h4>CAREER HUB</h4>
                  <p className={styles.smallText}>Exclusive alumni job boards and priority referral pathways.</p>
                </div>
                
                {/* Feature Card: Ventures */}
                <div className={styles.glassCard}>
                  <div className={`${styles.cardIconBox} ${styles.iconOrangeAlt}`}>
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <h4>VENTURES</h4>
                  <p className={styles.smallText}>Seed funding and strategic support for alumni-led startups.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UPCOMING GATHERINGS SECTION */}
        <section className={styles.eventsSection} id="events">
          <div className={styles.sectionHeaderFlex}>
            <div>
              <h2 className={styles.sectionTitle}>Upcoming Gatherings</h2>
              <p className={styles.sectionSubtitle}>Moments to reconnect and celebrate our shared journey</p>
            </div>
            <a href="#" className={styles.viewAllLink}>VIEW ALL EVENTS</a>
          </div>

          <div className={styles.eventsGrid}>
            {/* Event 1 */}
            <div className={`${styles.glassCardEvent} ${styles.groupHover}`}>
               <div className={styles.eventImagePlaceholder}>
                  <div className={styles.dateBadge}>
                     <span className={styles.dateMonth}>DEC</span>
                     <span className={styles.dateDay}>24</span>
                  </div>
                  <span className={`material-symbols-outlined ${styles.watermarkIcon}`}>festival</span>
               </div>
               <div className={styles.eventInfo}>
                  <div className={styles.eventTag}>
                     <span className="material-symbols-outlined">pin_drop</span>
                     Main Campus
                  </div>
                  <h3 className={styles.eventTitle}>Silver Jubilee Reunion '99</h3>
                  <p className={styles.eventDesc}>Honoring 25 years of excellence. A night of nostalgia, networking, and celebrating institutional growth.</p>
                  <button className={styles.registerBtn}>REGISTER NOW</button>
               </div>
            </div>

            {/* Event 2 */}
            <div className={`${styles.glassCardEvent} ${styles.groupHover}`}>
               <div className={styles.eventImagePlaceholder}>
                  <div className={styles.dateBadge}>
                     <span className={styles.dateMonth}>JAN</span>
                     <span className={styles.dateDay}>15</span>
                  </div>
                  <span className={`material-symbols-outlined ${styles.watermarkIcon}`}>data_object</span>
               </div>
               <div className={styles.eventInfo}>
                  <div className={styles.eventTag}>
                     <span className="material-symbols-outlined">podium</span>
                     Virtual Hub
                  </div>
                  <h3 className={styles.eventTitle}>Alumni Tech Summit</h3>
                  <p className={styles.eventDesc}>Deep dive into GenAI with alumni leading core engineering teams at global giants like Google and AWS.</p>
                  <button className={styles.registerBtn}>REGISTER NOW</button>
               </div>
            </div>

            {/* Event 3 */}
            <div className={`${styles.glassCardEvent} ${styles.groupHover}`}>
               <div className={styles.eventImagePlaceholder}>
                  <div className={styles.dateBadge}>
                     <span className={styles.dateMonth}>FEB</span>
                     <span className={styles.dateDay}>02</span>
                  </div>
                  <span className={`material-symbols-outlined ${styles.watermarkIcon}`}>diversity_3</span>
               </div>
               <div className={styles.eventInfo}>
                  <div className={styles.eventTag}>
                     <span className="material-symbols-outlined">meeting_room</span>
                     Placement Cell
                  </div>
                  <h3 className={styles.eventTitle}>Career Bridge Day</h3>
                  <p className={styles.eventDesc}>A direct interaction day for final year students to meet hiring managers from our illustrious alumni pool.</p>
                  <button className={styles.registerBtn}>REGISTER NOW</button>
               </div>
            </div>
          </div>
        </section>

        {/* SUCCESS PATHS SECTION (WITH ANIMATION) */}
        <section className={styles.testimonialSection} id="stories">
          <div className={styles.sectionHeaderCenter}>
            <h2 className={styles.sectionTitle}>Success Paths</h2>
            <p className={styles.sectionSubtitle}>How KSRCE shaped global industry leaders</p>
          </div>

          <div className={styles.testimonialWrapper}>
             <div className={styles.testimonialSlider}>
                {/* Slide 1 */}
                <div className={styles.testimonialSlide}>
                  <div className={styles.quoteIconBox}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <blockquote className={styles.blockquote}>
                    <span className="material-symbols-outlined">format_quote</span>
                    <p>
                      "The technical foundation at KSRCE was instrumental in my 
                      journey to engineering leadership. This portal is a brilliant bridge 
                      for us to give back."
                    </p>
                  </blockquote>
                  <div className={styles.quoteAuthorArea}>
                    <h4>Dr. Rajesh Kumar</h4>
                    <p>BATCH OF 2008 <span>|</span> SENIOR ENGINEERING DIRECTOR</p>
                  </div>
                </div>

                {/* Slide 2 */}
                <div className={styles.testimonialSlide}>
                  <div className={styles.quoteIconBox}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <blockquote className={styles.blockquote}>
                    <span className="material-symbols-outlined">format_quote</span>
                    <p>
                      "Founding my venture was possible because of the KSRCE network. The mentorship here is truly world-class and deeply rooted in excellence."
                    </p>
                  </blockquote>
                  <div className={styles.quoteAuthorArea}>
                    <h4>Sneha Kapoor</h4>
                    <p>BATCH OF 2014 <span>|</span> TECH FOUNDER & CEO</p>
                  </div>
                </div>

                {/* Slide 3 */}
                <div className={styles.testimonialSlide}>
                  <div className={styles.quoteIconBox}>
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <blockquote className={styles.blockquote}>
                    <span className="material-symbols-outlined">format_quote</span>
                    <p>
                      "KSRCE provided not just a degree, but a lifetime of connections that open doors globally. I am incredibly proud to be an alum."
                    </p>
                  </blockquote>
                  <div className={styles.quoteAuthorArea}>
                    <h4>Arun Varma</h4>
                    <p>BATCH OF 2005 <span>|</span> PRINCIPAL ARCHITECT</p>
                  </div>
                </div>
             </div>
             
             {/* Slider Indicators */}
             <div className={styles.sliderIndicators}>
               <div className={`${styles.indicator} ${styles.indicatorActive}`}></div>
               <div className={styles.indicator}></div>
               <div className={styles.indicator}></div>
             </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          
          <div className={styles.footerBrand}>
             <div className={styles.footerLogoRow}>
               <div className={styles.sealIconFooter}>
                 <span className="material-symbols-outlined">account_balance</span>
               </div>
             </div>
             <p className={styles.footerDesc}>
               Building a bridge between our glorious past 
               and an innovative future. K.S.R. College of 
               Engineering Alumni Association.
             </p>
             <div className={styles.socialIcons}>
               <a href="#"><span className="material-symbols-outlined">hub</span></a>
               <a href="#"><span className="material-symbols-outlined">forum</span></a>
             </div>
          </div>

          <div className={styles.footerLinksCol}>
            <h4>NAVIGATION</h4>
            <a href="#">Find Friends</a>
            <a href="#">Event Gallery</a>
            <a href="#">Job Portal</a>
            <a href="#">Philanthropy</a>
          </div>

          <div className={styles.footerLinksCol}>
            <h4>CONNECT</h4>
            <a href="#">Campus Map</a>
            <a href="#">Magazine</a>
            <a href="#">Support Desk</a>
          </div>

          <div className={styles.footerNewsletter}>
            <h4>NEWSLETTER</h4>
            <p>Get curated alumni updates monthly.</p>
            <div className={styles.newsletterInput}>
              <input type="email" placeholder="Email address" />
              <button><span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
          </div>

        </div>

        <div className={styles.footerBottom}>
          <p>© 2024 K.S.R. COLLEGE OF ENGINEERING. ALL RIGHTS RESERVED.</p>
          <div className={styles.footerBottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button className={styles.fabBtn}>
        <span className="material-symbols-outlined">person_add</span>
        <span className={styles.fabTooltip}>JOIN NOW</span>
      </button>

    </div>
  );
};

export default LandingPage;