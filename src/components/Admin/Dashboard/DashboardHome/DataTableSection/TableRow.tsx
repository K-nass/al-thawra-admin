import type { CommentInterface, MessageInterface } from "../DashboardHome";

export default function TableRow({
  item,
}: {
  item: CommentInterface | MessageInterface;
}) {
  const isComment = "comment" in item;
  const content = isComment ? item.comment : item.message;
  const name = isComment ? item.name : ("username" in item ? item.username : "");
  
  return (
    <tr className="border-t border-slate-200">
      <td className="py-3 px-3">{item.id}</td>
      <td className="py-3 px-3">{name}</td>
      {"email" in item && <td className="py-3 px-3">{item.email}</td>}
      <td className="py-3 px-3">{content}</td>
      <td className="py-3 px-3 whitespace-nowrap">{item.date}</td>
    </tr>
  );
}
