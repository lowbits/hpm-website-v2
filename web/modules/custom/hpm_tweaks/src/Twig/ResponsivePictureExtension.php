<?php

declare(strict_types=1);

namespace Drupal\hpm_tweaks\Twig;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\image\Entity\ImageStyle;
use Twig\Extension\AbstractExtension;
use Twig\Markup;
use Twig\TwigFunction;

/**
 * Twig extension providing responsive_picture() for <picture> elements.
 *
 * Generates breakpoint-aware <picture> with 1x/2x density descriptors
 * and WebP image styles based on the designer's specifications.
 */
class ResponsivePictureExtension extends AbstractExtension {

  /**
   * Breakpoint media queries, ordered largest-first.
   */
  private const BREAKPOINTS = [
    'xl' => '(min-width: 120rem)',
    'lg' => '(min-width: 82rem)',
    'md' => '(min-width: 60rem)',
    'sm' => '(min-width: 45rem)',
    // xs = fallback <img>, no media query.
  ];

  /**
   * Width-based breakpoint maps per component type.
   *
   * Each entry: breakpoint => [1x_width, 2x_width].
   * The 'xs' key is the fallback for the <img> element.
   */
  private const BREAKPOINT_MAP = [
    'stage_portrait' => [
      'sm' => [864, 1728],
      'xs' => [680, 1360],
    ],
    'stage_landscape' => [
      'lg' => [1760, 2000],
      'md' => [1216, 2000],
    ],
    'alternate' => [
      'xl' => [960, 1920],
      'lg' => [960, 1920],
      'md' => [656, 1312],
      'sm' => [912, 1824],
      'xs' => [700, 1400],
    ],
    'teaser' => [
      'xl' => [620, 1240],
      'lg' => [620, 1240],
      'md' => [540, 1080],
      'sm' => [540, 1080],
      'xs' => [620, 1240],
    ],
    'box_teaser' => [
      'xl' => [880, 1760],
      'lg' => [880, 1760],
      'md' => [720, 1440],
      'sm' => [720, 1440],
      'xs' => [620, 1240],
    ],
    'stage_media' => [
      'xl' => [1020, 1920],
      'lg' => [1020, 1920],
      'md' => [700, 1400],
      'sm' => [700, 1400],
      'xs' => [700, 1400],
    ],
    'poster' => [
      'xl' => [1728, 2000],
      'lg' => [1728, 2000],
      'md' => [1216, 2000],
      'sm' => [864, 1728],
      'xs' => [700, 1400],
    ],
    'people' => [
      'xl' => [430, 860],
      'lg' => [430, 860],
      'md' => [370, 740],
      'sm' => [370, 740],
      'xs' => [550, 1100],
    ],
    'segments_overview' => [
      'xl' => [560, 1120],
      'lg' => [560, 1120],
      'md' => [390, 780],
      'sm' => [420, 840],
      'xs' => [680, 1360],
    ],
    'news_item' => [
      'xl' => [870, 1740],
      'lg' => [870, 1740],
      'md' => [600, 1200],
      'sm' => [720, 1440],
      'xs' => [680, 1360],
    ],
  ];

  /**
   * Intrinsic dimensions per component type for CLS prevention.
   *
   * These width/height values are added to the fallback <img> so the
   * browser can reserve the correct aspect ratio before loading.
   * Values from designer specs (g31-marc, 2026-05-17).
   */
  private const DIMENSIONS = [
    'stage_portrait' => [1728, 2246],
    'stage_landscape' => [1920, 960],
    'alternate' => [1920, 1280],
    'teaser' => [1920, 1280],
    'box_teaser' => [1920, 1280],
    'stage_media' => [2040, 1347],
    'poster' => [2000, 1000],
    'people' => [1110, 1480],
    'segments_overview' => [1110, 1480],
    'news_item' => [1740, 1160],
  ];

  /**
   * Height-based breakpoint map for gallery.
   *
   * Each entry: breakpoint => [1x_height, 2x_height].
   */
  private const GALLERY_MAP = [
    'xl' => [512, 1024],
    'lg' => [512, 1024],
    'md' => [384, 768],
    'sm' => [384, 768],
    'xs' => [192, 384],
  ];

  /**
   * Static cache for loaded image styles.
   *
   * @var array<string, \Drupal\image\Entity\ImageStyle|null>
   */
  private array $styleCache = [];

  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function getFunctions(): array {
    return [
      new TwigFunction('responsive_picture', [$this, 'responsivePicture'], ['is_safe' => ['html']]),
      new TwigFunction('responsive_srcset', [$this, 'responsiveSrcset'], ['is_safe' => ['html']]),
      new TwigFunction('responsive_img', [$this, 'responsiveImg'], ['is_safe' => ['html']]),
    ];
  }

  /**
   * Generate a <picture> element with responsive sources.
   *
   * @param string|null $uri
   *   The file URI (e.g. 'public://image.jpg').
   * @param string $type
   *   The component type key (e.g. 'alternate', 'poster', 'people').
   * @param array $options
   *   Optional attributes: alt, loading, class, fetchpriority.
   *
   * @return \Twig\Markup
   *   Safe HTML markup for the <picture> element.
   */
  public function responsivePicture(?string $uri, string $type, array $options = []): Markup {
    if (!$uri) {
      return new Markup('', 'UTF-8');
    }

    $alt = htmlspecialchars($this->toPlainString($options['alt'] ?? ''), ENT_QUOTES, 'UTF-8');
    $loading = $options['loading'] ?? 'lazy';
    $class = $options['class'] ?? '';
    $fetchpriority = $options['fetchpriority'] ?? '';

    // Intrinsic dimensions for CLS prevention.
    $dimensions = self::DIMENSIONS[$type] ?? NULL;

    if ($type === 'gallery') {
      return $this->buildGalleryPicture($uri, $alt, $loading, $class, $fetchpriority);
    }

    $map = self::BREAKPOINT_MAP[$type] ?? NULL;
    if (!$map) {
      // Unknown type — fall back to simple img with original file.
      $url = $this->fileUrl($uri);
      return new Markup('<img src="' . $url . '" alt="' . $alt . '" loading="' . $loading . '">', 'UTF-8');
    }

    $sources = [];
    $fallback_src = '';
    $fallback_srcset = '';

    foreach (self::BREAKPOINTS as $bp => $media) {
      if (!isset($map[$bp])) {
        continue;
      }
      [$w1x, $w2x] = $map[$bp];
      $url1x = $this->styleUrl($uri, "rimg_{$w1x}w");
      $url2x = $this->styleUrl($uri, "rimg_{$w2x}w");
      $sources[] = '<source media="' . $media . '" srcset="' . $url1x . ' 1x, ' . $url2x . ' 2x" type="image/webp">';
    }

    // xs fallback for <img>, or first available breakpoint if xs doesn't exist.
    $fallback_sizes = $map['xs'] ?? reset($map);
    if ($fallback_sizes) {
      [$w1x, $w2x] = $fallback_sizes;
      $fallback_src = $this->styleUrl($uri, "rimg_{$w1x}w");
      $fallback_srcset = $fallback_src . ' 1x, ' . $this->styleUrl($uri, "rimg_{$w2x}w") . ' 2x';
    }

    return $this->buildPictureTag($sources, $fallback_src, $fallback_srcset, $alt, $loading, $class, $fetchpriority, $dimensions);
  }

  /**
   * Generate a srcset string for a specific breakpoint.
   *
   * Useful for art-directed <picture> elements where the template builds
   * the <source>/<img> structure manually.
   *
   * @param string|null $uri
   *   The file URI.
   * @param string $type
   *   The component type key.
   * @param string $breakpoint
   *   The breakpoint key (xs, sm, md, lg, xl). Defaults to 'xs'.
   *
   * @return string
   *   The srcset value (e.g. "url 1x, url 2x").
   */
  public function responsiveSrcset(?string $uri, string $type, string $breakpoint = 'xs'): string {
    if (!$uri) {
      return '';
    }
    $map = self::BREAKPOINT_MAP[$type] ?? NULL;
    if (!$map || !isset($map[$breakpoint])) {
      return $this->fileUrl($uri);
    }
    [$w1x, $w2x] = $map[$breakpoint];
    $url1x = $this->styleUrl($uri, "rimg_{$w1x}w");
    $url2x = $this->styleUrl($uri, "rimg_{$w2x}w");
    return $url1x . ' 1x, ' . $url2x . ' 2x';
  }

  /**
   * Generate just an <img> tag with 1x/2x srcset for the xs breakpoint.
   *
   * @param string|null $uri
   *   The file URI.
   * @param string $type
   *   The component type key.
   * @param array $options
   *   Optional attributes: alt, loading, class, fetchpriority.
   *
   * @return \Twig\Markup
   *   Safe HTML for the <img> element.
   */
  public function responsiveImg(?string $uri, string $type, array $options = []): Markup {
    if (!$uri) {
      return new Markup('', 'UTF-8');
    }
    $alt = htmlspecialchars($this->toPlainString($options['alt'] ?? ''), ENT_QUOTES, 'UTF-8');
    $loading = $options['loading'] ?? 'lazy';
    $class = $options['class'] ?? '';
    $fetchpriority = $options['fetchpriority'] ?? '';

    $map = self::BREAKPOINT_MAP[$type] ?? NULL;
    $sizes = $map['xs'] ?? ($map ? reset($map) : NULL);
    if (!$sizes) {
      $url = $this->fileUrl($uri);
      return new Markup('<img src="' . $url . '" alt="' . $alt . '" loading="' . $loading . '">', 'UTF-8');
    }
    [$w1x, $w2x] = $sizes;
    $src = $this->styleUrl($uri, "rimg_{$w1x}w");
    $srcset = $src . ' 1x, ' . $this->styleUrl($uri, "rimg_{$w2x}w") . ' 2x';

    $dimensions = self::DIMENSIONS[$type] ?? NULL;
    $attrs = 'src="' . $src . '" srcset="' . $srcset . '" alt="' . $alt . '"';
    if ($dimensions) {
      $attrs .= ' width="' . $dimensions[0] . '" height="' . $dimensions[1] . '"';
    }
    $attrs .= ' loading="' . $loading . '"';
    if ($class) {
      $attrs .= ' class="' . htmlspecialchars($class, ENT_QUOTES, 'UTF-8') . '"';
    }
    if ($fetchpriority) {
      $attrs .= ' fetchpriority="' . htmlspecialchars($fetchpriority, ENT_QUOTES, 'UTF-8') . '"';
    }
    return new Markup('<img ' . $attrs . '>', 'UTF-8');
  }

  /**
   * Safely convert a value to a plain string for use in HTML attributes.
   */
  private function toPlainString(mixed $value): string {
    if (is_string($value)) {
      return $value;
    }
    if (is_object($value) && method_exists($value, '__toString')) {
      return (string) $value;
    }
    if (is_array($value)) {
      return '';
    }
    return (string) ($value ?? '');
  }

  /**
   * Build a gallery <picture> using height-based image styles.
   */
  private function buildGalleryPicture(string $uri, string $alt, string $loading, string $class, string $fetchpriority): Markup {
    $sources = [];

    foreach (self::BREAKPOINTS as $bp => $media) {
      if (!isset(self::GALLERY_MAP[$bp])) {
        continue;
      }
      [$h1x, $h2x] = self::GALLERY_MAP[$bp];
      $url1x = $this->styleUrl($uri, "rimg_{$h1x}h");
      $url2x = $this->styleUrl($uri, "rimg_{$h2x}h");
      $sources[] = '<source media="' . $media . '" srcset="' . $url1x . ' 1x, ' . $url2x . ' 2x" type="image/webp">';
    }

    [$h1x, $h2x] = self::GALLERY_MAP['xs'];
    $fallback_src = $this->styleUrl($uri, "rimg_{$h1x}h");
    $fallback_srcset = $fallback_src . ' 1x, ' . $this->styleUrl($uri, "rimg_{$h2x}h") . ' 2x';

    return $this->buildPictureTag($sources, $fallback_src, $fallback_srcset, $alt, $loading, $class, $fetchpriority);
  }

  /**
   * Assemble the final <picture> tag.
   */
  private function buildPictureTag(array $sources, string $fallback_src, string $fallback_srcset, string $alt, string $loading, string $class, string $fetchpriority, ?array $dimensions = NULL): Markup {
    $html = '<picture>' . "\n";
    foreach ($sources as $source) {
      $html .= '  ' . $source . "\n";
    }
    $img_attrs = 'src="' . $fallback_src . '"';
    if ($fallback_srcset) {
      $img_attrs .= ' srcset="' . $fallback_srcset . '"';
    }
    $img_attrs .= ' alt="' . $alt . '"';
    if ($dimensions) {
      $img_attrs .= ' width="' . $dimensions[0] . '" height="' . $dimensions[1] . '"';
    }
    $img_attrs .= ' loading="' . $loading . '"';
    if ($class) {
      $img_attrs .= ' class="' . htmlspecialchars($class, ENT_QUOTES, 'UTF-8') . '"';
    }
    if ($fetchpriority) {
      $img_attrs .= ' fetchpriority="' . htmlspecialchars($fetchpriority, ENT_QUOTES, 'UTF-8') . '"';
    }
    $html .= '  <img ' . $img_attrs . '>' . "\n";
    $html .= '</picture>';

    return new Markup($html, 'UTF-8');
  }

  /**
   * Get an image style URL for a given URI, as a relative path.
   */
  private function styleUrl(string $uri, string $style_name): string {
    $style = $this->loadStyle($style_name);
    if (!$style) {
      return $this->fileUrl($uri);
    }
    $url = $style->buildUrl($uri);
    // Convert to relative path to avoid http/https issues.
    return parse_url($url, PHP_URL_PATH) . '?' . parse_url($url, PHP_URL_QUERY);
  }

  /**
   * Load an image style with static caching.
   */
  private function loadStyle(string $name): ?ImageStyle {
    if (!array_key_exists($name, $this->styleCache)) {
      $this->styleCache[$name] = ImageStyle::load($name);
    }
    return $this->styleCache[$name];
  }

  /**
   * Get a relative file URL.
   */
  private function fileUrl(string $uri): string {
    $url = \Drupal::service('file_url_generator')->generateAbsoluteString($uri);
    return parse_url($url, PHP_URL_PATH);
  }

}
