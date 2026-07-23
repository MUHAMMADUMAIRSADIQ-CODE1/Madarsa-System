import { useScrollReveal } from '../../hooks/useScrollReveal';

/**
 * ScrollReveal — wraps children and reveals them (fade-in + slide-up)
 * when the wrapper enters the viewport, using Intersection Observer.
 *
 * Props:
 *  - delay:     transition-delay in ms (for stagger effects). Default 0
 *  - threshold: IntersectionObserver threshold. Default 0.15
 *  - rootMargin: Observer root margin. Default '0px 0px -50px 0px'
 *  - once:      Only animate once. Default true
 *  - as:        HTML tag to render. Default 'div'
 *  - className: Additional classes
 *  - style:     Additional inline styles
 *  - children:  Content to reveal
 *  - ...props:  Spread onto the wrapper element
 */
export default function ScrollReveal({
  children,
  delay = 0,
  threshold,
  rootMargin,
  once = true,
  as: Tag = 'div',
  className = '',
  style = {},
  ...props
}) {
  const [ref, isVisible] = useScrollReveal({ threshold, rootMargin, once });

  return (
    <Tag
      ref={ref}
      className={`scroll-reveal${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{
        ...style,
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
