import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, image, url, type = "website", schema }) => {
  const siteTitle = "DD Tours | Elite Adventure Expeditions";
  const currentTitle = title ? `${title} | DD Tours` : siteTitle;
  const currentDesc =
    description ||
    "Join elite expeditions across India. Trekking in Himalayas, Jungle Survival, and Desert Safaris. Verified reviews and seamless booking.";
  const siteUrl = "https://ddtours.in"; // ⚠️ REPLACE with your actual domain
  const currentUrl = url || window.location.href;
  const currentImage = image || `${siteUrl}/images/social-share.jpg`; // Make sure this image exists in public/images/

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

      {/* 4. Structured Data (JSON-LD) for Rich Snippets */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
