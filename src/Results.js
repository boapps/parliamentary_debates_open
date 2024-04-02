import React from "react";
import { Pagination, Modal, Button, Card } from "react-bootstrap";
import get_pages from "./pagination";
import config from "./config.json";
import Chart from "./Chart";
import ExportCSV from "./ExportCSV";

const joinHighlightParts = (parts) => parts.join("&nbsp;[&hellip;]&nbsp;");
const getHighlightPart = (input) =>
  joinHighlightParts(Array.isArray(input) ? input : [input]);

const getHighlightParts = (highlight) =>
  [highlight.bill_title, highlight.text]
    .filter((i) => i !== undefined)
    .map(getHighlightPart);

const formatHighlight = (highlight) =>
  joinHighlightParts(getHighlightParts(highlight));

function Results(props) {
  const {
    results,
    page,
    navigate_to_page,
    close_modal,
    term,
    isLoading,
    filterType,
  } = props;

  let hitOpen = null;

  const handleHitOpen = (index) => {
    hitOpen = index;
  };

  const handleCloseModal = () => {
    hitOpen = null;
  };

  const filteredResults = filterType
    ? results.hits.hits.filter((result) => result._source.type === filterType)
    : results.hits.hits;

  const renderedElements = filteredResults.map((result, index) => (
    <a
      key={result._id}
      className="hiddenLink"
      href="#"
      onClick={(e) => {
        e.preventDefault();
        handleHitOpen(index);
      }}
    >
      <Card>
        <Card.Header>
          <a
            href="#"
            className="title"
            onClick={(e) => {
              e.preventDefault();
              handleHitOpen(index);
            }}
          >
            {result._source.speaker} &mdash;
            <b>
              {Array.isArray(result._source.topic)
                ? result._source.topic.join(", ")
                : result._source.topic}
            </b>
          </a>
          <span className="date">{result._source.date} </span>
        </Card.Header>

        <Card.Body>
          <p
            dangerouslySetInnerHTML={{
              __html:
                formatHighlight(result.highlight) ||
                result._source.text.slice(0, 150),
            }}
          />
          <p>
            ({result._source.session},{result._source.sitting_type})
          </p>
        </Card.Body>
      </Card>
    </a>
  ));

  return results.hits.total.value > 0 ? (
    <div>
      <h2>
        {results.hits.total.value} találat &quot;{term}&quot; kulcsszóra:
      </h2>
      <Chart
        {...results}
        style={{ margin: "auto", width: 600 }}
        width={600}
        height={300}
      />
      <ExportCSV results={results} />

      <div className="CardList">{renderedElements}</div>
      <div>
        <Pagination>
          {get_pages(config.page_size, results.hits.total.value)
            .filter(
              (number) =>
                Math.min(
                  number,
                  Math.abs(number - page),
                  Math.abs(
                    Math.ceil(results.hits.total.value / config.page_size) -
                      number
                  )
                ) < 3
            )
            .reduce(
              (a, b) =>
                a.length === 0
                  ? a.concat([b])
                  : a.slice(-1)[0] + 1 === b
                  ? a.concat([b])
                  : a.concat(["...", b]),
              []
            )
            .map((number) =>
              number === "..." ? (
                <Pagination.Ellipsis key={Math.random()} />
              ) : (
                <Pagination.Item
                  key={number}
                  active={number * 1 === page * 1}
                  onClick={() => navigate_to_page(number)}
                >
                  {number + 1}
                </Pagination.Item>
              )
            )}
        </Pagination>
      </div>

      <Modal show={hitOpen !== null} onHide={handleCloseModal}>
        {hitOpen !== null && (
          <React.Fragment>
            <Modal.Header closeButton>
              <Modal.Title>
                {results.hits.hits[hitOpen]._source.speaker} &mdash;
                <b>
                  {Array.isArray(results.hits.hits[hitOpen]._source.topic)
                    ? results.hits.hits[hitOpen]._source.topic.join(", ")
                    : results.hits.hits[hitOpen]._source.topic}
                </b>
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p>
                {results.hits.hits[hitOpen]._source.date}, (
                {results.hits.hits[hitOpen]._source.session},{" "}
                {results.hits.hits[hitOpen]._source.sitting_type})
              </p>
              <p>{results.hits.hits[hitOpen]._source.text}</p>
              <p className="source">
                Forrás:{" "}
                <a href={results.hits.hits[hitOpen]._source.url}>
                  {results.hits.hits[hitOpen]._source.url}
                </a>
              </p>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="primary" onClick={handleCloseModal}>
                Bezárás
              </Button>
            </Modal.Footer>
          </React.Fragment>
        )}
      </Modal>
    </div>
  ) : term && !isLoading ? (
    <div>
      <h2>Nincs találat &quot;{term}&quot; kulcsszóra &#9785;</h2>{" "}
    </div>
  ) : null;
}

export default Results;
