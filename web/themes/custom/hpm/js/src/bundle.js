/**
 * @file
 * HPM Theme – single production bundle.
 *
 * GSAP + ScrollTrigger from npm. Flickity and component scripts
 * are concatenated via the rollup config.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
