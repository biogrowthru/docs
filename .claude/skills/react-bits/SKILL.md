---
name: react-bits
description: React Bits — 130+ animated, interactive React + Tailwind components (text animations, backgrounds, cursors, cards, carousels, scroll effects). Use when a React page needs a memorable animated element: copy the component source from components/<Category>/<Name>/ into the project and install its listed dependencies (motion, gsap, ogl, three) only if needed.
---

# React Bits (Tailwind variant)

Source: https://github.com/DavidHDev/react-bits (MIT + Commons Clause, see LICENSE.md). Components are copied into the project, not installed from npm.

How to use:
1. Find a component below, open `components/<Category>/<Name>/` and read its `.jsx`.
2. Check its imports: `motion/react`, `gsap`, `ogl`, `three`, `@react-three/*`. Prefer components that need only `motion` or nothing; heavy WebGL ones only for one signature moment, lazy-loaded.
3. Copy into `src/components/` of the project, adapt props, colours and copy; respect `prefers-reduced-motion`.

## Catalogue
- **Animations**: AnimatedContent, Antigravity, BlobCursor, ClickSpark, Crosshair, Cubes, CursorGrid, DitherVeil, ElasticMesh, ElectricBorder, ElectricLogo, FadeContent, GhostCursor, GlareHover, GlowCursor, GradualBlur, HalftoneReveal, ImageTrail, LaserFlow, LogoLoop, MagicRings, Magnet, MagnetLines, MetaBalls, MetallicPaint, Noise, OrbitImages, PixelSwap, PixelTrail, PixelTransition, Ribbons, RippleDistortion, ScrollExpand, ShapeBlur, SplashCursor, StarBorder, StickerPeel, Strands, SwarmCursor, TargetCursor
- **Backgrounds**: AcidSquares, AeroShards, Aurora, Balatro, Ballpit, Beams, CRTWarp, ColorBends, DarkVeil, Dither, DotField, DotGrid, EvilEye, FaultyTerminal, Ferrofluid, FloatingLines, Galaxy, GhostFibers, GradientBlinds, GradientWaves, Grainient, GridDistortion, GridMotion, GridScan, Hyperspeed, Iridescence, LetterGlitch, LightPillar, LightRays, LightTunnel, Lightfall, Lightning, LineWaves, LiquidChrome, LiquidEther, MicroSlats, MoltenMetal, Orb, Particles, PatternWaves, PixelBlast, PixelSnow, Plasma, PlasmaWave, Prism, PrismaticBurst, Radar, RippleGrid, Scanner, ShapeGrid, ShapeWaves, SideRays, Silk, SlicedWaves, SoftAurora, Threads, Topography, Waves, WebThreads
- **Components**: AccordionGallery, AnimatedList, BorderGlow, BounceCards, BubbleMenu, CardNav, CardSwap, Carousel, ChromaGrid, CircularCarousel, CircularGallery, Counter, CurvedInput, DecayCard, DepthCarousel, Dock, DomeGallery, DriftWall, ElasticSlider, FlexCarousel, FlowingMenu, FluidGlass, FlyingPosters, Folder, GlassIcons, GlassSurface, GooeyNav, InfiniteMenu, InfiniteSpiral, Lanyard, LineSidebar, MagicBento, Masonry, ModelViewer, MorphSlider, OptionWheel, PillNav, PixelCard, ProfileCard, ReflectiveCard, ScrollStack, SpecularButton, SpotlightCard, Stack, StaggeredMenu, Stepper, TiltedCard
- **Micro**: BellToggle, BranchedMenu, CallChip, CodeSlots, CometDial, DodgeField, FlipCard, FolderFloat, FuseButton, GlideSelect, HoldButton, JellyRadio, LatticeLoader, PaperCrumple, PeekRating, PromptBar, PulseHeart, RefineFrame, RubberSegment, ScrubField, Shredder, SlideCommit, SlingButton, SloshGauge, SpringCheck, SquishSwitch, StatusMark, SwipeRow, SwipeToast, TearTicket, ThoughtLine, VoicePill, WakeSlider, WarmTooltip
- **TextAnimations**: ASCIIText, BlurText, CircularText, CountUp, CurvedLoop, DecryptedText, DepthText, EchoText, FallingText, FoldText, FuzzyText, GlitchText, GradientText, MaskedHeading, ParticleText, RotatingText, ScrambledText, ScrollFloat, ScrollReveal, ScrollVelocity, ShinyText, Shuffle, SplitFlapText, SplitText, StrokeText, TechText, TextCursor, TextLoop, TextPressure, TextType, TrueFocus, VariableProximity, WarpText
