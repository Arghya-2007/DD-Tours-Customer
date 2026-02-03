import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, image, url, type = "website", schema }) => {
  // 🛠️ CONFIG: Default values for your site
  const siteTitle = "DD Tours and Travels | Elite Adventure Expeditions";
  const siteUrl = "https://ddtours.in"; // Replace with your actual domain if different
  const defaultDescription =
    "Join elite expeditions across India. Trekking in Himalayas, Jungle Survival, and Desert Safaris. Verified reviews and seamless booking.";
  const defaultImage = `${siteUrl}/images/social-img.webp`;
  // Logic: Use provided props OR fall back to defaults
  const currentTitle = title ? `${title} | DD Tours and Travels` : siteTitle;
  const currentDesc = description || defaultDescription;
  const currentUrl = url || window.location.href;
  const currentImage = image || defaultImage;

  return (
    <Helmet>
      {/* 1. Standard Metadata */}
      <title>{currentTitle}</title>
      <meta name="description" content={currentDesc} />
      <link rel="canonical" href={currentUrl} />

      {/* 2. Facebook / Open Graph */}
      <meta property="og:site_name" content="DD Tours" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={currentTitle} />
      <meta property="og:description" content={currentDesc} />
      <meta property="og:image" content={currentImage} />
      <meta property="og:url" content={currentUrl} />

      {/* 3. Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={currentTitle} />
      <meta name="twitter:description" content={currentDesc} />
      <meta name="twitter:image" content={currentImage} />

      {/* 4. Structured Data (Rich Snippets) */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
