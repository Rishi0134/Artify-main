const ART_CATEGORIES = [
  { name: "Portrait", description: "Portrait focused artwork." },
  { name: "Landscape", description: "Natural or scenic landscape artwork." },
  { name: "Still Life", description: "Artwork featuring arranged inanimate subjects." },
  { name: "Historical", description: "Artwork based on historical themes or events." },
  { name: "Genre", description: "Scenes from everyday life and human activity." },
  { name: "Religious", description: "Artwork with spiritual or religious themes." },
  { name: "Abstract", description: "Non-representational and conceptual artwork." },
  { name: "Wildlife", description: "Artwork centered on animals and wildlife." },
  { name: "Marine", description: "Artwork inspired by oceans, ships, and sea life." },
  { name: "Cityscape", description: "Urban scenes, buildings, and city environments." },
  { name: "Figurative", description: "Artwork representing the human figure." },
  { name: "Narrative", description: "Artwork that tells a story or sequence." },
  { name: "Realism", description: "Artwork depicting subjects with realistic detail." },
  { name: "Impressionism", description: "Artwork focused on light, movement, and impressions." },
  { name: "Expressionism", description: "Artwork conveying emotion and subjective perspective." },
  { name: "Cubism", description: "Artwork using fragmented and geometric forms." },
  { name: "Surrealism", description: "Dreamlike and imaginative artwork." },
  { name: "Pop Art", description: "Artwork inspired by popular culture and bold visuals." },
  { name: "Minimalism", description: "Artwork using simplicity and limited elements." },
  { name: "Contemporary", description: "Modern artwork reflecting current themes and practice." },
  { name: "Oil", description: "Artwork created using oil paint technique." },
  { name: "Watercolor", description: "Artwork created using watercolor technique." },
  { name: "Acrylic", description: "Artwork created using acrylic paint technique." },
  { name: "Gouache", description: "Artwork created using gouache technique." },
  { name: "Fresco", description: "Artwork created using fresco wall-painting technique." },
  { name: "Ink", description: "Artwork created using ink technique." },
  { name: "Digital", description: "Artwork created digitally." },
];

const ALLOWED_CATEGORY_NAMES = new Set(ART_CATEGORIES.map((category) => category.name));

module.exports = {
  ALLOWED_CATEGORY_NAMES,
  ART_CATEGORIES,
};
