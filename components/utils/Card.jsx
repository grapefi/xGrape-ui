export function Card ({ children, title, subtitle, note }) {
  return (
    <div className="rounded-md shadow bg-brand-4 text-primary-content">
      <div className="flex text-4xl font-superstar pl-5 pt-5">
        {title}
      </div>
      <div className="flex text-1xl pl-5 pt-1">
        {subtitle}
      </div>
      <div className="flex text-1xl pl-5 pt-1">
        {note}
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}

export default Card;