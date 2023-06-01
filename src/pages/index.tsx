import { type NextPage } from 'next';
import Head from 'next/head';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { api } from '~/utils/api';

import Logged from './logged';

const Home: NextPage = () => {
	const { data: sessionData } = useSession();

	const { data: userData } = api.users.getUserData.useQuery(undefined, {
		enabled: sessionData?.user !== undefined,
	});

	useEffect(() => {
		if (sessionData?.user && userData && userData.type === 'user') {
			setTimeout(() => {
				void signOut();
			}, 1000);
		}
	}, [sessionData?.user, userData]);

	return (
		<>
			<Head>
				<title>Shayenek - Todos and notes</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="flex min-h-screen flex-col items-center bg-[#101213]">
				{sessionData && (
					<button
						className="mt-4 hidden rounded-full bg-red-500 px-10 py-3 font-semibold text-white no-underline transition hover:bg-red-800 md:absolute md:right-4 md:block"
						onClick={() => void signOut()}
					>
						Sign Out
					</button>
				)}
				<div className="container mb-20 mt-14 flex flex-col items-center justify-center gap-12 p-4 md:mb-0 md:mt-0 md:py-16">
					{!sessionData && (
						<h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
							Log In
						</h1>
					)}
					<div className="flex w-full flex-col items-center gap-2 md:mt-8">
						{!sessionData && (
							<button
								className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
								onClick={() => void signIn()}
							>
								Sign In
							</button>
						)}
						{sessionData && (
							<>
								{userData && userData.type === 'admin' ? (
									<Logged />
								) : (
									<h1 className="text-4xl font-extrabold text-white">
										Forbidden!
									</h1>
								)}
							</>
						)}
					</div>
				</div>
			</main>
		</>
	);
};

export default Home;
