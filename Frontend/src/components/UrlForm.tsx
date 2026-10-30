import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { createShortUrl } from "../api/shortUrl.api";
import { useAppSelector } from "../store/store";
import { getErrorMessage } from "../utils/helper";

const UrlForm = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState("");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultInput = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (shortUrl) resultInput.current?.focus();
  }, [shortUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setShortUrl("");
    setCopied(false);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    try {
      setShortUrl(await createShortUrl(url.trim(), customSlug.trim()));
      void queryClient.invalidateQueries({ queryKey: ["userUrls"] });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setError(null);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Couldn't copy that. Select the link below and copy it manually.");
      resultInput.current?.focus();
      resultInput.current?.select();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="url-form space-y-4" aria-busy={loading}>
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          Your long URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/something-great"
          required
          disabled={loading}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby="url-hint"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p id="url-hint" className="form-hint">
          Paste the whole link, including https://
        </p>
      </div>
      {isAuthenticated && (
        <div>
          <label
            htmlFor="customSlug"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Make it yours <span className="optional-label">(optional)</span>
          </label>
          <input
            type="text"
            id="customSlug"
            value={customSlug}
            onChange={(event) => setCustomSlug(event.target.value)}
            placeholder="e.g. summer-playlist"
            disabled={loading}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      <button
        disabled={loading}
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Shortening your link..." : "Shorten my link"}
        {!loading && <span aria-hidden="true"> ↗</span>}
      </button>
      <p role="status" className="sr-only">
        {loading
          ? "Shortening your link."
          : shortUrl
            ? "Your short link is ready."
            : ""}
      </p>
      {error && (
        <div role="alert" className="form-error">
          {error}
        </div>
      )}
      {shortUrl && (
        <div className="link-result">
          <h3 className="result-heading">Ready to share.</h3>
          <div className="result-controls">
            <input
              ref={resultInput}
              type="text"
              readOnly
              aria-label="Your shortened URL"
              value={shortUrl}
              onFocus={(event) => event.target.select()}
              className="flex-1 p-2 border border-gray-300 bg-gray-50"
            />
            <button type="button" onClick={handleCopy} className="copy-button">
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
          <p role="status" className="form-hint">
            {copied
              ? "All yours. Paste it wherever you like."
              : "Copy it into a message, post, or email."}
          </p>
        </div>
      )}
    </form>
  );
};

export default UrlForm;
