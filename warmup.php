<?php

/**
 * One-time image style warmup script.
 *
 * Run via: drush scr warmup.php
 * Delete after use.
 */

$styles = \Drupal::entityTypeManager()->getStorage('image_style')->loadMultiple();
$files = \Drupal::entityTypeManager()->getStorage('file')->loadByProperties(['status' => 1]);
$count = 0;

foreach ($files as $file) {
  $uri = $file->getFileUri();
  if (!str_starts_with($uri, 'public://') || !preg_match('/\.(jpe?g|png|webp|gif)$/i', $uri)) {
    continue;
  }
  foreach ($styles as $style) {
    if (str_starts_with($style->id(), 'rimg_')) {
      $dest = $style->buildUri($uri);
      if (!file_exists($dest)) {
        $style->createDerivative($uri, $dest);
        $count++;
      }
    }
  }
}

echo "Generated $count derivatives.\n";
