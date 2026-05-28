<?php

declare(strict_types=1);

namespace Drupal\hpm_forms\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\Entity\File;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Handles custom job application form submissions.
 */
class JobApplicationController extends ControllerBase {

  /**
   * Mail recipient.
   */
  const MAIL_TO = 'karriere@hoecker-pm.net';

  /**
   * Envelope sender / From address.
   */
  const MAIL_FROM_ADDRESS = 'noreply@hoecker-pm.com';

  /**
   * From display name.
   */
  const MAIL_FROM_NAME = 'HOECKER Project Managers - Bewerbung';

  /**
   * Default subject line.
   */
  const MAIL_SUBJECT = 'Neue Bewerbung über das HPM Website-Formular';

  public function __construct(
    protected FileSystemInterface $fileSystem,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('file_system'),
    );
  }

  /**
   * Process form submission.
   */
  public function submit(Request $request): JsonResponse {
    // Honeypot check.
    if ($request->request->get('website', '') !== '') {
      return new JsonResponse(['ok' => TRUE]);
    }

    // Collect field values.
    $fields = [
      'vorname' => $this->clean($request->request->get('vorname', '')),
      'nachname' => $this->clean($request->request->get('nachname', '')),
      'email' => $this->clean($request->request->get('email', '')),
      'telefon' => $this->clean($request->request->get('telefon', '')),
      'quelle' => $this->clean($request->request->get('quelle', '')),
      'standort' => $this->clean($request->request->get('standort', '')),
      'gehalt' => $this->clean($request->request->get('gehalt', '')),
      'application_title' => $this->clean($request->request->get('application_title', '')),
    ];

    // Basic server-side validation.
    $errors = [];
    if (mb_strlen(trim($fields['vorname'])) < 2) {
      $errors[] = 'Vorname ist erforderlich.';
    }
    if (mb_strlen(trim($fields['nachname'])) < 2) {
      $errors[] = 'Nachname ist erforderlich.';
    }
    if (!filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) {
      $errors[] = 'Ungültige E-Mail-Adresse.';
    }
    if (!$request->request->get('datenschutz_1')) {
      $errors[] = 'Datenschutz-Einwilligung ist erforderlich.';
    }

    if ($errors) {
      return new JsonResponse([
        'ok' => FALSE,
        'message' => implode(' ', $errors),
      ], 422);
    }

    // Handle file uploads.
    $attachments = [];
    $attachmentFids = [];
    $uploadedFiles = $request->files->get('attachments', []);
    if (!is_array($uploadedFiles)) {
      $uploadedFiles = [$uploadedFiles];
    }

    $totalSize = 0;
    foreach ($uploadedFiles as $uploadedFile) {
      if (!$uploadedFile || !$uploadedFile->isValid()) {
        continue;
      }

      $totalSize += $uploadedFile->getSize();
      if ($totalSize > 10 * 1024 * 1024) {
        return new JsonResponse([
          'ok' => FALSE,
          'message' => 'Die Gesamtgröße aller Dateien darf maximal 10 MB sein.',
        ], 422);
      }

      $extension = strtolower($uploadedFile->getClientOriginalExtension());
      if ($extension !== 'pdf') {
        return new JsonResponse([
          'ok' => FALSE,
          'message' => 'Es sind nur PDF-Dateien erlaubt.',
        ], 422);
      }

      $directory = 'private://webform/job_application';
      $this->fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY);

      $filename = $uploadedFile->getClientOriginalName();
      $destination = $directory . '/' . $filename;
      $uri = $this->fileSystem->move($uploadedFile->getRealPath(), $destination);

      if ($uri) {
        $file = File::create([
          'uri' => $uri,
          'filename' => $filename,
          'filemime' => 'application/pdf',
          'status' => 1,
        ]);
        $file->save();
        $attachmentFids[] = $file->id();

        $realpath = $this->fileSystem->realpath($uri);
        $attachments[] = [
          'path' => $realpath,
          'orig' => $filename,
          'clean' => $this->normalizeFilename($filename),
          'size' => $uploadedFile->getSize(),
        ];
      }
    }

    // Consent values.
    $ds1 = (bool) $request->request->get('datenschutz_1');
    $ds2 = (bool) $request->request->get('datenschutz_2');
    $ds3 = (bool) $request->request->get('datenschutz_3');

    // Store as webform submission.
    $webform = $this->entityTypeManager()->getStorage('webform')->load('job_application');
    if ($webform) {
      $webformStorage = $this->entityTypeManager()->getStorage('webform_submission');
      $values = [
        'webform_id' => 'job_application',
        'data' => [
          'job_title' => $fields['application_title'],
          'firstname' => $fields['vorname'],
          'lastname' => $fields['nachname'],
          'email' => $fields['email'],
          'phone' => $fields['telefon'],
          'how_found_us' => $fields['quelle'],
          'location' => $fields['standort'],
          'salary_expectation' => $fields['gehalt'],
          'resume' => $attachmentFids[0] ?? NULL,
          'cover_letter' => $attachmentFids[1] ?? NULL,
          'privacy_data' => $ds1,
          'privacy_storage' => $ds2,
          'privacy_contact' => $ds3,
        ],
      ];
      $submission = $webformStorage->create($values);
      $submission->save();
    }

    // Send email via raw mail() — matching the static page approach.
    $this->sendMail($fields, $attachments, $totalSize, $ds1, $ds2, $ds3);

    return new JsonResponse(['ok' => TRUE]);
  }

  /**
   * Send email using PHP mail() with multipart MIME and attachments.
   */
  protected function sendMail(array $fields, array $attachments, int $totalSize, bool $ds1, bool $ds2, bool $ds3): bool {
    $boundary = '=_Form_' . bin2hex(random_bytes(16));
    $name = trim($fields['vorname'] . ' ' . $fields['nachname']);
    $jobTitle = $fields['application_title'] ?: 'Initiativbewerbung';

    // Headers.
    $headers = [];
    $headers[] = sprintf('From: %s <%s>', $this->mimeHeader(self::MAIL_FROM_NAME), self::MAIL_FROM_ADDRESS);
    $headers[] = sprintf('Reply-To: %s <%s>', $this->mimeHeader($name), $fields['email']);
    $headers[] = 'Return-Path: <' . self::MAIL_FROM_ADDRESS . '>';
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

    // Text part.
    $text = "Neue Bewerbung:\r\n\r\n";
    $text .= "Name: {$name}\r\n";
    $text .= "E-Mail: {$fields['email']}\r\n";
    $text .= "Telefon: {$fields['telefon']}\r\n";
    $text .= "Standort: {$fields['standort']}\r\n";
    if ($fields['gehalt'] !== '') {
      $text .= "Gehaltsvorstellung: {$fields['gehalt']}\r\n";
    }
    if ($fields['application_title'] !== '') {
      $text .= "Stelle / Bezug: {$fields['application_title']}\r\n";
    }
    $text .= "Quelle: {$fields['quelle']}\r\n";
    $text .= "Datum: " . date('d.m.Y H:i') . "\r\n\r\n";

    $text .= "Dateianhänge (Gesamt: " . number_format($totalSize / 1024 / 1024, 2, ',', '.') . " MB):\r\n";
    foreach ($attachments as $a) {
      $text .= "• Original: " . $a['orig'] . "\r\n";
      $text .= "  Versandt: " . $a['clean'] . " (" . number_format($a['size'] / 1024 / 1024, 2, ',', '.') . " MB)\r\n";
    }
    $text .= "\r\n";

    $text .= "Einwilligungen:\r\n";
    $text .= "• Bewerbung: " . ($ds1 ? 'JA' : 'NEIN') . "\r\n";
    $text .= "• Speicherung: " . ($ds2 ? 'JA' : 'NEIN') . "\r\n";
    $text .= "• Weitergabe: " . ($ds3 ? 'JA' : 'NEIN') . "\r\n";

    // Multipart body.
    $body = "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=utf-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $text . "\r\n";

    // Attachments.
    foreach ($attachments as $a) {
      $pdfData = file_get_contents($a['path']);
      if ($pdfData === FALSE) {
        continue;
      }
      $pdfB64 = chunk_split(base64_encode($pdfData));
      $safeName = addslashes($a['clean']);

      $body .= "--{$boundary}\r\n";
      $body .= "Content-Type: application/pdf; name=\"{$safeName}\"\r\n";
      $body .= "Content-Transfer-Encoding: base64\r\n";
      $body .= "Content-Disposition: attachment; filename=\"{$safeName}\"\r\n\r\n";
      $body .= $pdfB64 . "\r\n";
    }
    $body .= "--{$boundary}--";

    // Subject.
    $subject = self::MAIL_SUBJECT;
    if ($fields['application_title'] !== '') {
      $subject .= ' - ' . $fields['application_title'];
    }
    $subject = $this->mimeHeader($subject);

    return mail(
      self::MAIL_TO,
      $subject,
      $body,
      implode("\r\n", $headers),
      '-f ' . self::MAIL_FROM_ADDRESS
    );
  }

  /**
   * Strip header injection characters.
   */
  protected function clean(string $s): string {
    return str_replace(["\r", "\n", "%0a", "%0d"], ' ', trim($s));
  }

  /**
   * Encode a string for use in mail headers (RFC 2047).
   */
  protected function mimeHeader(string $str): string {
    return '=?UTF-8?B?' . base64_encode($str) . '?=';
  }

  /**
   * Normalize filename: replace umlauts, strip special chars.
   */
  protected function normalizeFilename(string $filename): string {
    $filename = basename($filename);
    $map = [
      'ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue',
      'Ä' => 'Ae', 'Ö' => 'Oe', 'Ü' => 'Ue',
      'ß' => 'ss',
    ];
    $filename = strtr($filename, $map);
    $filename = preg_replace('/[^A-Za-z0-9._-]/', '_', $filename);
    $filename = preg_replace('/_+/', '_', $filename);
    return $filename;
  }

}
