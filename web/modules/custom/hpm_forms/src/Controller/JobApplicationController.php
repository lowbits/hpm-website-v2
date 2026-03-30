<?php

declare(strict_types=1);

namespace Drupal\hpm_forms\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\file\Entity\File;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Handles custom job application form submissions.
 */
class JobApplicationController extends ControllerBase {

  public function __construct(
    protected FileSystemInterface $fileSystem,
    protected MailManagerInterface $mailManager,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('file_system'),
      $container->get('plugin.manager.mail'),
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
      'vorname' => $request->request->get('vorname', ''),
      'nachname' => $request->request->get('nachname', ''),
      'email' => $request->request->get('email', ''),
      'telefon' => $request->request->get('telefon', ''),
      'quelle' => $request->request->get('quelle', ''),
      'standort' => $request->request->get('standort', ''),
      'gehalt' => $request->request->get('gehalt', ''),
      'application_title' => $request->request->get('application_title', ''),
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
    $attachmentPaths = [];
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
        $attachmentPaths[] = $this->fileSystem->realpath($uri);
      }
    }

    // Store as webform submission.
    $webformStorage = $this->entityTypeManager()->getStorage('webform_submission');
    $webform = $this->entityTypeManager()->getStorage('webform')->load('job_application');
    if ($webform) {
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
          'privacy_data' => (bool) $request->request->get('datenschutz_1'),
          'privacy_storage' => (bool) $request->request->get('datenschutz_2'),
          'privacy_contact' => (bool) $request->request->get('datenschutz_3'),
        ],
      ];
      $submission = $webformStorage->create($values);
      $submission->save();
    }

    // Send email notification.
    $jobTitle = $fields['application_title'] ?: 'Initiativbewerbung';
    $name = trim($fields['vorname'] . ' ' . $fields['nachname']);

    $body = [];
    $body[] = "Neue Bewerbung: {$jobTitle}";
    $body[] = '';
    $body[] = "Name: {$name}";
    $body[] = "E-Mail: {$fields['email']}";
    if ($fields['telefon']) {
      $body[] = "Telefon: {$fields['telefon']}";
    }
    if ($fields['standort']) {
      $body[] = "Standort: {$fields['standort']}";
    }
    if ($fields['gehalt']) {
      $body[] = "Gehaltsvorstellung: {$fields['gehalt']}";
    }
    if ($fields['quelle']) {
      $body[] = "Aufmerksam geworden durch: {$fields['quelle']}";
    }
    $body[] = '';
    $body[] = count($attachmentFids) . ' Datei(en) angehängt.';

    $params = [
      'subject' => "Neue Bewerbung: {$jobTitle}",
      'body' => implode("\n", $body),
      'attachments' => $attachmentPaths,
    ];

    $this->mailManager->mail(
      'hpm_forms',
      'job_application',
      'karriere@hoecker-pm.com',
      'de',
      $params,
    );

    return new JsonResponse(['ok' => TRUE]);
  }

}
