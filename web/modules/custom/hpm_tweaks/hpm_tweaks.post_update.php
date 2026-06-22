<?php

/**
 * @file
 * Install, update and uninstall functions for the HPM Tweaks module.
 */

use Drupal\block_content\Entity\BlockContent;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Create default Karriere (Standorte) block content if missing.
 */
function hpm_tweaks_post_update_create_karriere_block(): string {
  $storage = \Drupal::entityTypeManager()->getStorage('block_content');
  $existing = $storage->loadByProperties(['type' => 'karriere_standorte']);
  if ($existing) {
    return 'Karriere (Standorte) Block existiert bereits — keine Aktion.';
  }

  $paragraph = Paragraph::create([
    'type' => 'alternate',
    'field_headline' => 'Werden Sie Teil unseres Teams',
    'field_text' => [
      'value' => '<p>Sie suchen eine neue Herausforderung im Projektmanagement? Entdecken Sie unsere aktuellen Stellenangebote und bewerben Sie sich.</p>',
      'format' => 'basic_html',
    ],
    'field_link' => [
      'uri' => 'internal:/stellenangebote',
      'title' => 'Zu den Stellenangeboten',
    ],
    'field_media_position' => 'right',
  ]);
  $paragraph->save();

  $block = BlockContent::create([
    'type' => 'karriere_standorte',
    'info' => 'Karriere (Standorte)',
    'field_paragraphs' => [$paragraph],
  ]);
  $block->save();

  return sprintf('Karriere (Standorte) Block (ID %d) mit Default-Inhalt erstellt.', $block->id());
}
