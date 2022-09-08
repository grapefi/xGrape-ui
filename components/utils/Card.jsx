export function Card ({ children, title }) {
  return (
    <div className="rounded-md shadow bg-brand-4 text-primary-content">
      <div className="flex text-4xl font-superstar pl-5 pt-5">
        {title}
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}

export default Card;