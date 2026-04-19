import { redirect } from "next/navigation";

/** Trang chính là `/`; giữ `/crud` redirect để bookmark cũ vẫn hoạt động. */
export default function CrudLegacyRedirect() {
	redirect("/");
}
