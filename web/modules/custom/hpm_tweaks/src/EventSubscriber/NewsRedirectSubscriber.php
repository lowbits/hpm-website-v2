<?php

namespace Drupal\hpm_tweaks\EventSubscriber;

use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Redirects news node pages to the news overview with an anchor.
 */
class NewsRedirectSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::REQUEST => ['onRequest', 30],
    ];
  }

  /**
   * Redirects news detail pages to /neuigkeiten#news-{nid}.
   */
  public function onRequest(RequestEvent $event): void {
    $request = $event->getRequest();
    $route_match = \Drupal::routeMatch();
    $route_name = $route_match->getRouteName();

    if ($route_name !== 'entity.node.canonical') {
      return;
    }

    $node = $route_match->getParameter('node');
    if (!$node instanceof NodeInterface || $node->bundle() !== 'news') {
      return;
    }

    $url = Url::fromRoute('view.news_listing.page_1', [], [
      'fragment' => 'news-' . $node->id(),
    ])->toString();

    $event->setResponse(new RedirectResponse($url, 301));
  }

}
