import {
  ContributionGraph,
  InfoCard,
  RecentRepoList,
} from "@/components/sections/GitHubCards";
import { Container } from "@/components/ui/Container";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { getContributions, githubUsername } from "@/lib/github-contributions";
import { getRecentRepos } from "@/lib/github-repos";
import siteConfig from "@/plinth.config";

/**
 * Who you are, then your GitHub activity: the last 9 months of contributions and your
 * latest repos. The GitHub row reads the username from the GitHub link in `socials`,
 * and hides itself when there isn't one or GitHub can't be reached.
 */
export async function About() {
  const { paragraphs, label, headline, year } = siteConfig.about;
  const github = githubUsername();
  const [contributions, recent] = github
    ? await Promise.all([getContributions(github), getRecentRepos(github)])
    : [null, null];
  const repos = recent ?? [];

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      data-reveal
      className="py-section"
    >
      <Container className="flex flex-col gap-stack">
        {/* Same columns as Experience, so the two sections share one grid down the page.
            The heading, the paragraphs and then each GitHub card come in one by one. */}
        <div className="reveal-items grid gap-stack md:grid-cols-[minmax(0,541fr)_minmax(0,656fr)] md:gap-x-[10.7%]">
          <div className="flex flex-col gap-3">
            <h2
              id="about-heading"
              className="text-tag font-semibold tracking-wide text-fg-muted uppercase"
            >
              {label} |{" "}
              {year ?? <CurrentYear buildYear={new Date().getFullYear()} />}
            </h2>
            <p className="text-h2 font-semibold">{headline}</p>
          </div>
          <div className="max-w-[38rem] space-y-[1em] text-lead font-normal text-fg-muted">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {(contributions || repos.length > 0) && (
          // The graph leads the row, wider than the repos beside it.
          <div className="reveal-items grid gap-3 [--i:2] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            {contributions && (
              <ContributionGraph data={contributions} compact months={9} />
            )}
            {repos.length > 0 && (
              <InfoCard title="Latest repos">
                <RecentRepoList repos={repos} />
              </InfoCard>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
