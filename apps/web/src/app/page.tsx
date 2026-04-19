"use client";

import { Button } from "@repo/ui/button";
import { type FormEvent, useCallback, useEffect, useState } from "react";

type Tab = "users" | "sessions" | "accounts" | "verifications";

async function getApiConfigUrl() {
	try {
		const response = await fetch("/api/config");
		if (!response.ok) throw new Error(String(response.status));
		const data = await response.json();
		return { apiUrl: data.apiUrl as string | null };
	} catch {
		return { apiUrl: null };
	}
}

export default function Home() {
	const [apiUrl, setApiUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState<Tab>("users");
	const [error, setError] = useState<string | undefined>();
	const [busy, setBusy] = useState(false);

	const [users, setUsers] = useState<Record<string, unknown>[]>([]);
	const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
	const [accounts, setAccounts] = useState<Record<string, unknown>[]>([]);
	const [verifications, setVerifications] = useState<Record<string, unknown>[]>(
		[],
	);

	const [uName, setUName] = useState("");
	const [uEmail, setUEmail] = useState("");
	const [uVerified, setUVerified] = useState(false);
	const [editUserId, setEditUserId] = useState<string | null>(null);

	const [vIdentifier, setVIdentifier] = useState("");
	const [vValue, setVValue] = useState("");
	const [vExpires, setVExpires] = useState("");
	const [editVerId, setEditVerId] = useState<string | null>(null);

	useEffect(() => {
		void getApiConfigUrl().then((c) => {
			setApiUrl(c.apiUrl || "http://localhost:3001");
			setLoading(false);
		});
	}, []);

	const base = useCallback(() => {
		if (!apiUrl) throw new Error("Chưa có API URL");
		return `${apiUrl.replace(/\/$/, "")}/api/crud`;
	}, [apiUrl]);

	const loadUsers = useCallback(async () => {
		if (!apiUrl) return;
		setBusy(true);
		setError(undefined);
		try {
			const r = await fetch(`${base()}/users`);
			if (!r.ok) throw new Error(await r.text());
			setUsers((await r.json()) as Record<string, unknown>[]);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Lỗi tải users");
		} finally {
			setBusy(false);
		}
	}, [apiUrl, base]);

	const loadSessions = useCallback(async () => {
		if (!apiUrl) return;
		setBusy(true);
		setError(undefined);
		try {
			const r = await fetch(`${base()}/sessions`);
			if (!r.ok) throw new Error(await r.text());
			setSessions((await r.json()) as Record<string, unknown>[]);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Lỗi tải sessions");
		} finally {
			setBusy(false);
		}
	}, [apiUrl, base]);

	const loadAccounts = useCallback(async () => {
		if (!apiUrl) return;
		setBusy(true);
		setError(undefined);
		try {
			const r = await fetch(`${base()}/accounts`);
			if (!r.ok) throw new Error(await r.text());
			setAccounts((await r.json()) as Record<string, unknown>[]);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Lỗi tải accounts");
		} finally {
			setBusy(false);
		}
	}, [apiUrl, base]);

	const loadVerifications = useCallback(async () => {
		if (!apiUrl) return;
		setBusy(true);
		setError(undefined);
		try {
			const r = await fetch(`${base()}/verifications`);
			if (!r.ok) throw new Error(await r.text());
			setVerifications((await r.json()) as Record<string, unknown>[]);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Lỗi tải verifications");
		} finally {
			setBusy(false);
		}
	}, [apiUrl, base]);

	useEffect(() => {
		if (!apiUrl || loading) return;
		if (tab === "users") void loadUsers();
		if (tab === "sessions") void loadSessions();
		if (tab === "accounts") void loadAccounts();
		if (tab === "verifications") void loadVerifications();
	}, [
		tab,
		apiUrl,
		loading,
		loadUsers,
		loadSessions,
		loadAccounts,
		loadVerifications,
	]);

	const createUser = async (e: FormEvent) => {
		e.preventDefault();
		if (!apiUrl) return;
		setBusy(true);
		setError(undefined);
		try {
			const r = await fetch(`${base()}/users`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: uName,
					email: uEmail,
					emailVerified: uVerified,
				}),
			});
			if (!r.ok) {
				const j = await r.json().catch(() => ({}));
				throw new Error((j as { error?: string }).error || (await r.text()));
			}
			setUName("");
			setUEmail("");
			setUVerified(false);
			await loadUsers();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lỗi tạo user");
		} finally {
			setBusy(false);
		}
	};

	const patchUser = async (e: FormEvent) => {
		e.preventDefault();
		if (!editUserId || !apiUrl) return;
		setBusy(true);
		setError(undefined);
		try {
			const r = await fetch(
				`${base()}/users/${encodeURIComponent(editUserId)}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: uName || undefined,
						email: uEmail || undefined,
						emailVerified: uVerified,
					}),
				},
			);
			if (!r.ok) {
				const j = await r.json().catch(() => ({}));
				throw new Error((j as { error?: string }).error || (await r.text()));
			}
			setEditUserId(null);
			setUName("");
			setUEmail("");
			await loadUsers();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lỗi cập nhật user");
		} finally {
			setBusy(false);
		}
	};

	const deleteUser = async (id: string) => {
		if (!apiUrl || !confirm("Xóa user này?")) return;
		setBusy(true);
		try {
			const r = await fetch(`${base()}/users/${encodeURIComponent(id)}`, {
				method: "DELETE",
			});
			if (!r.ok && r.status !== 204) {
				const j = await r.json().catch(() => ({}));
				throw new Error((j as { error?: string }).error || (await r.text()));
			}
			await loadUsers();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lỗi xóa");
		} finally {
			setBusy(false);
		}
	};

	const startEditUser = (u: Record<string, unknown>) => {
		setEditUserId(String(u.id));
		setUName(String(u.name ?? ""));
		setUEmail(String(u.email ?? ""));
		setUVerified(Boolean(u.emailVerified));
	};

	const deleteSession = async (id: string) => {
		if (!apiUrl || !confirm("Xóa session? (đăng xuất token)")) return;
		setBusy(true);
		try {
			const r = await fetch(`${base()}/sessions/${encodeURIComponent(id)}`, {
				method: "DELETE",
			});
			if (!r.ok && r.status !== 204) {
				const j = await r.json().catch(() => ({}));
				throw new Error((j as { error?: string }).error || (await r.text()));
			}
			await loadSessions();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lỗi xóa");
		} finally {
			setBusy(false);
		}
	};

	const deleteAccount = async (id: string) => {
		if (!apiUrl || !confirm("Xóa account liên kết?")) return;
		setBusy(true);
		try {
			const r = await fetch(`${base()}/accounts/${encodeURIComponent(id)}`, {
				method: "DELETE",
			});
			if (!r.ok && r.status !== 204) {
				const j = await r.json().catch(() => ({}));
				throw new Error((j as { error?: string }).error || (await r.text()));
			}
			await loadAccounts();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lỗi xóa");
		} finally {
			setBusy(false);
		}
	};

	const createVerification = async (e: FormEvent) => {
		e.preventDefault();
		if (!apiUrl) return;
		setBusy(true);
		setError(undefined);
		try {
			const r = await fetch(`${base()}/verifications`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					identifier: vIdentifier,
					value: vValue,
					expiresAt: vExpires,
				}),
			});
			if (!r.ok) {
				const j = await r.json().catch(() => ({}));
				throw new Error((j as { error?: string }).error || (await r.text()));
			}
			setVIdentifier("");
			setVValue("");
			setVExpires("");
			await loadVerifications();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lỗi tạo verification");
		} finally {
			setBusy(false);
		}
	};

	const patchVerification = async (e: FormEvent) => {
		e.preventDefault();
		if (!editVerId || !apiUrl) return;
		setBusy(true);
		setError(undefined);
		try {
			const r = await fetch(
				`${base()}/verifications/${encodeURIComponent(editVerId)}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						identifier: vIdentifier || undefined,
						value: vValue || undefined,
						expiresAt: vExpires || undefined,
					}),
				},
			);
			if (!r.ok) {
				const j = await r.json().catch(() => ({}));
				throw new Error((j as { error?: string }).error || (await r.text()));
			}
			setEditVerId(null);
			setVIdentifier("");
			setVValue("");
			setVExpires("");
			await loadVerifications();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lỗi cập nhật");
		} finally {
			setBusy(false);
		}
	};

	const deleteVerification = async (id: string) => {
		if (!apiUrl || !confirm("Xóa verification?")) return;
		setBusy(true);
		try {
			const r = await fetch(
				`${base()}/verifications/${encodeURIComponent(id)}`,
				{ method: "DELETE" },
			);
			if (!r.ok && r.status !== 204) {
				const j = await r.json().catch(() => ({}));
				throw new Error((j as { error?: string }).error || (await r.text()));
			}
			await loadVerifications();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lỗi xóa");
		} finally {
			setBusy(false);
		}
	};

	const startEditVer = (row: Record<string, unknown>) => {
		setEditVerId(String(row.id));
		setVIdentifier(String(row.identifier ?? ""));
		setVValue(String(row.value ?? ""));
		setVExpires(
			row.expiresAt
				? new Date(String(row.expiresAt)).toISOString().slice(0, 16)
				: "",
		);
	};

	const tabBtn = (t: Tab, label: string) => (
		<button
			type="button"
			onClick={() => {
				setTab(t);
				setError(undefined);
				setEditUserId(null);
				setEditVerId(null);
			}}
			style={{
				padding: "0.5rem 1rem",
				borderRadius: 6,
				border: "1px solid #cbd5e0",
				background: tab === t ? "#4299e1" : "#fff",
				color: tab === t ? "#fff" : "#2d3748",
				cursor: "pointer",
			}}
		>
			{label}
		</button>
	);

	if (loading) {
		return (
			<div style={{ padding: "2rem", textAlign: "center" }}>Đang tải...</div>
		);
	}

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
				padding: "1.5rem",
			}}
		>
			<div style={{ maxWidth: 1100, margin: "0 auto" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: "1rem",
						flexWrap: "wrap",
						gap: "0.5rem",
					}}
				>
					<h1 style={{ margin: 0, fontSize: "1.5rem" }}>CRUD (Prisma)</h1>
					<span style={{ color: "#718096", fontSize: "0.85rem" }}>
						API: {apiUrl}
					</span>
				</div>

				<div
					style={{
						display: "flex",
						gap: "0.5rem",
						marginBottom: "1rem",
						flexWrap: "wrap",
					}}
				>
					{tabBtn("users", "User")}
					{tabBtn("sessions", "Session")}
					{tabBtn("accounts", "Account")}
					{tabBtn("verifications", "Verification")}
				</div>

				{error && (
					<div
						style={{
							padding: "0.75rem",
							background: "#fed7d7",
							color: "#c53030",
							borderRadius: 6,
							marginBottom: "1rem",
						}}
					>
						{error}
					</div>
				)}

				{tab === "users" && (
					<section>
						<p style={{ color: "#4a5568", marginTop: 0 }}>
							Đầy đủ CRUD. User do Better Auth tạo khi đăng ký vẫn hiện ở đây.
						</p>
						<form
							onSubmit={editUserId ? patchUser : createUser}
							style={{
								display: "grid",
								gap: "0.5rem",
								maxWidth: 420,
								marginBottom: "1.5rem",
								padding: "1rem",
								background: "#fff",
								borderRadius: 8,
								boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
							}}
						>
							<strong>{editUserId ? "Sửa user" : "Tạo user"}</strong>
							<label>
								Tên
								<input
									value={uName}
									onChange={(e) => setUName(e.target.value)}
									required={!editUserId}
									style={{ width: "100%", marginTop: 4, padding: 8 }}
								/>
							</label>
							<label>
								Email
								<input
									type="email"
									value={uEmail}
									onChange={(e) => setUEmail(e.target.value)}
									required={!editUserId}
									style={{ width: "100%", marginTop: 4, padding: 8 }}
								/>
							</label>
							<label style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<input
									type="checkbox"
									checked={uVerified}
									onChange={(e) => setUVerified(e.target.checked)}
								/>
								emailVerified
							</label>
							<div style={{ display: "flex", gap: 8 }}>
								<Button type="submit" disabled={busy}>
									{editUserId ? "Lưu" : "Tạo"}
								</Button>
								{editUserId && (
									<Button
										type="button"
										onClick={() => {
											setEditUserId(null);
											setUName("");
											setUEmail("");
										}}
									>
										Hủy sửa
									</Button>
								)}
							</div>
						</form>

						<div
							style={{ overflowX: "auto", background: "#fff", borderRadius: 8 }}
						>
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr style={{ background: "#edf2f7", textAlign: "left" }}>
										<th style={{ padding: 8 }}>Email</th>
										<th style={{ padding: 8 }}>Name</th>
										<th style={{ padding: 8 }}>id</th>
										<th style={{ padding: 8 }} />
									</tr>
								</thead>
								<tbody>
									{users.map((u) => (
										<tr
											key={String(u.id)}
											style={{ borderTop: "1px solid #e2e8f0" }}
										>
											<td style={{ padding: 8 }}>{String(u.email)}</td>
											<td style={{ padding: 8 }}>{String(u.name)}</td>
											<td
												style={{
													padding: 8,
													fontSize: "0.75rem",
													wordBreak: "break-all",
												}}
											>
												{String(u.id)}
											</td>
											<td style={{ padding: 8 }}>
												<Button type="button" onClick={() => startEditUser(u)}>
													Sửa
												</Button>{" "}
												<Button
													type="button"
													onClick={() => deleteUser(String(u.id))}
												>
													Xóa
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{users.length === 0 && (
								<p style={{ padding: "1rem", color: "#718096" }}>
									Chưa có dữ liệu.
								</p>
							)}
						</div>
					</section>
				)}

				{tab === "sessions" && (
					<section>
						<p style={{ color: "#4a5568", marginTop: 0 }}>
							Chỉ đọc + xóa (Better Auth tạo session).
						</p>
						<div
							style={{ overflowX: "auto", background: "#fff", borderRadius: 8 }}
						>
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr style={{ background: "#edf2f7", textAlign: "left" }}>
										<th style={{ padding: 8 }}>userId</th>
										<th style={{ padding: 8 }}>expiresAt</th>
										<th style={{ padding: 8 }}>id</th>
										<th style={{ padding: 8 }} />
									</tr>
								</thead>
								<tbody>
									{sessions.map((s) => (
										<tr
											key={String(s.id)}
											style={{ borderTop: "1px solid #e2e8f0" }}
										>
											<td style={{ padding: 8, fontSize: "0.8rem" }}>
												{String(s.userId)}
											</td>
											<td style={{ padding: 8, fontSize: "0.8rem" }}>
												{String(s.expiresAt)}
											</td>
											<td
												style={{
													padding: 8,
													fontSize: "0.7rem",
													wordBreak: "break-all",
												}}
											>
												{String(s.id)}
											</td>
											<td style={{ padding: 8 }}>
												<Button
													type="button"
													onClick={() => deleteSession(String(s.id))}
												>
													Xóa
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{sessions.length === 0 && (
								<p style={{ padding: "1rem", color: "#718096" }}>
									Chưa có session.
								</p>
							)}
						</div>
					</section>
				)}

				{tab === "accounts" && (
					<section>
						<p style={{ color: "#4a5568", marginTop: 0 }}>
							Chỉ đọc + xóa (OAuth / mật khẩu do Better Auth).
						</p>
						<div
							style={{ overflowX: "auto", background: "#fff", borderRadius: 8 }}
						>
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr style={{ background: "#edf2f7", textAlign: "left" }}>
										<th style={{ padding: 8 }}>provider</th>
										<th style={{ padding: 8 }}>userId</th>
										<th style={{ padding: 8 }}>id</th>
										<th style={{ padding: 8 }} />
									</tr>
								</thead>
								<tbody>
									{accounts.map((a) => (
										<tr
											key={String(a.id)}
											style={{ borderTop: "1px solid #e2e8f0" }}
										>
											<td style={{ padding: 8 }}>{String(a.providerId)}</td>
											<td style={{ padding: 8, fontSize: "0.75rem" }}>
												{String(a.userId)}
											</td>
											<td
												style={{
													padding: 8,
													fontSize: "0.7rem",
													wordBreak: "break-all",
												}}
											>
												{String(a.id)}
											</td>
											<td style={{ padding: 8 }}>
												<Button
													type="button"
													onClick={() => deleteAccount(String(a.id))}
												>
													Xóa
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{accounts.length === 0 && (
								<p style={{ padding: "1rem", color: "#718096" }}>
									Chưa có account.
								</p>
							)}
						</div>
					</section>
				)}

				{tab === "verifications" && (
					<section>
						<p style={{ color: "#4a5568", marginTop: 0 }}>
							Đầy đủ CRUD (token xác minh email, v.v.).
						</p>
						<form
							onSubmit={editVerId ? patchVerification : createVerification}
							style={{
								display: "grid",
								gap: "0.5rem",
								maxWidth: 420,
								marginBottom: "1.5rem",
								padding: "1rem",
								background: "#fff",
								borderRadius: 8,
								boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
							}}
						>
							<strong>
								{editVerId ? "Sửa verification" : "Tạo verification"}
							</strong>
							<label>
								identifier
								<input
									value={vIdentifier}
									onChange={(e) => setVIdentifier(e.target.value)}
									required={!editVerId}
									style={{ width: "100%", marginTop: 4, padding: 8 }}
								/>
							</label>
							<label>
								value
								<input
									value={vValue}
									onChange={(e) => setVValue(e.target.value)}
									required={!editVerId}
									style={{ width: "100%", marginTop: 4, padding: 8 }}
								/>
							</label>
							<label>
								expiresAt (datetime-local / ISO)
								<input
									type="datetime-local"
									value={vExpires}
									onChange={(e) => setVExpires(e.target.value)}
									required={!editVerId}
									style={{ width: "100%", marginTop: 4, padding: 8 }}
								/>
							</label>
							<div style={{ display: "flex", gap: 8 }}>
								<Button type="submit" disabled={busy}>
									{editVerId ? "Lưu" : "Tạo"}
								</Button>
								{editVerId && (
									<Button
										type="button"
										onClick={() => {
											setEditVerId(null);
											setVIdentifier("");
											setVValue("");
											setVExpires("");
										}}
									>
										Hủy sửa
									</Button>
								)}
							</div>
						</form>

						<div
							style={{ overflowX: "auto", background: "#fff", borderRadius: 8 }}
						>
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr style={{ background: "#edf2f7", textAlign: "left" }}>
										<th style={{ padding: 8 }}>identifier</th>
										<th style={{ padding: 8 }}>expiresAt</th>
										<th style={{ padding: 8 }}>id</th>
										<th style={{ padding: 8 }} />
									</tr>
								</thead>
								<tbody>
									{verifications.map((v) => (
										<tr
											key={String(v.id)}
											style={{ borderTop: "1px solid #e2e8f0" }}
										>
											<td style={{ padding: 8 }}>{String(v.identifier)}</td>
											<td style={{ padding: 8, fontSize: "0.8rem" }}>
												{String(v.expiresAt)}
											</td>
											<td
												style={{
													padding: 8,
													fontSize: "0.7rem",
													wordBreak: "break-all",
												}}
											>
												{String(v.id)}
											</td>
											<td style={{ padding: 8 }}>
												<Button type="button" onClick={() => startEditVer(v)}>
													Sửa
												</Button>{" "}
												<Button
													type="button"
													onClick={() => deleteVerification(String(v.id))}
												>
													Xóa
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{verifications.length === 0 && (
								<p style={{ padding: "1rem", color: "#718096" }}>
									Chưa có verification.
								</p>
							)}
						</div>
					</section>
				)}

				{busy && (
					<p
						style={{ marginTop: "1rem", color: "#718096", fontSize: "0.9rem" }}
					>
						Đang xử lý…
					</p>
				)}
			</div>
		</div>
	);
}
